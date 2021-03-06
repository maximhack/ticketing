import request from 'supertest'

import { app } from '../../app';

it('Returns a 201 on successful signup', async ()=>{
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: "password"
    })
    .expect(201);
})

it('returns a 400 with an invalid email', async ()=>{
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'testtest.com',
        password: "password"
    })
    .expect(400);
})
it('returns a 400 with an invalid password', async ()=>{
    return request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: "pa"
    })
    .expect(400);
})

it('It disallows similar emails', async ()=>{
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: "password"
    })
    .expect(201);
    await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: "password"
    })
    .expect(400);
})

it("It sets a cookie after successful sign up", async ()=>{
    const response = await request(app)
    .post('/api/users/signup')
    .send({
        email: 'test@test.com',
        password: "password"
    })
    .expect(201);
    expect(response.get('Set-Cookie')).toBeDefined();
})