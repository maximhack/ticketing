import { Message } from "node-nats-streaming";
import {Subjects, Listener, TicketUpdatedEvent}  from '@smax_ticketing/common'
import { Ticket } from "../../models/tickets";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName
    async onMesssage(data: TicketUpdatedEvent['data'], msg: Message){
        const ticket = await Ticket.findByEvent(data);
        if(!ticket){
            throw new Error('Ticket not found')
        }
        const {title, price, version} = data;
        ticket.set({title, price, version})
        await ticket.save();
        msg.ack();
    }

}