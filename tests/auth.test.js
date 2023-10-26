const supertest = require('supertest');
const app = require('../api');
const { connect } = require('./database')
const UserModel = require('../models/user-model')

// Test Suite
describe('Authentication Tests', () => {
  let connection
  //before hook
  beforeAll(async () => {
    connection = await connect()
  })

  afterEach(async () => {
    await connection.cleanup()
  })

  //after hook
  afterAll(async () => {
    await connection.disconnect()
  })

  // Test Case
  it('should successfully register a user', async () => {
    const response = await supertest(app)
    .post('/users/signup')
    .set('content-type', 'application/json')
    .send({
      username: "sensamie",
      email: "sen@gmail.com",
      password: "12345678"
    })
    // expextations
    expect(response.status).toEqual(201)
    expect(response.body.user).toMatchObject({ 
      username: "sensamie",
      email: "sen@gmail.com",
    });
  })


  // Test Case
  it('should successfully login a user', async () => {
    await UserModel.create({
      username: "sensamie",
      email: "sen@gmail.com",
      password: "12345678"
    });

    const response = await supertest(app)
    .post('/users/login')
    .set('content-type', 'application/json')
    .send({
      username: "sensamie",
      password: "12345678"
    })

    // expectations
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject({
        message: 'Login successful',
        token: expect.any(String),
        user: expect.any(Object)
    })

    expect(response.body.user.username).toEqual('sensamie');
    expect(response.body.user.email).toEqual('sen@gmail.com');
  })

  //Test Case
  it('should not successfully login a user, when user does not exist', async () => {
    await UserModel.create({
      username: "sensamie",
      password: "12345678"
    });

    const response = await supertest(app)
    .post('/users/login')
    .set('content-type', 'application/json')
    .send({
      username: "sam",
      password: "12345678"
    })

    // expectations
    expect(response.status).toEqual(404);
    expect(response.body).toMatchObject({
      message: 'User not found',
    })
  })

})
