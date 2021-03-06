import { TicketUpdatedEvent } from "@smax_ticketing/common"
import { TicketUpdatedListener } from "../ticket-updated-listener"
import { natsWrapper } from "../../../nats-wrapper"
import { Ticket } from "../../../models/tickets"
import mongoose from 'mongoose'
import { Message } from "node-nats-streaming"

const setup = async ()=>{
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client)
    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()
    // Create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: 'new concert',
        price: 999,
        userId: '123'
    }
    // Create a fake msg object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }
    // return all of this stuff
    return {listener, ticket, data, msg};
}

it('finds, updates and saves a ticket', async ()=>{
    const {listener, ticket, data, msg} = await setup()

    await listener.onMesssage(data, msg);
    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket!.title).toEqual(data.title)
    expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async()=>{
    const {listener, ticket, data, msg} = await setup()
    await listener.onMesssage(data, msg);
    expect(msg.ack).toHaveBeenCalled()
})

it('doesnt call ack if the event has a future version', async ()=>{
    const {listener, ticket, data, msg} = await setup()
    data.version = 10;
    try{
        await listener.onMesssage(data, msg);
    } catch(err){

    }
    expect(msg.ack).not.toHaveBeenCalled();
})