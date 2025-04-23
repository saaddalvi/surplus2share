const prisma = require('./client');
const bcrypt = require('bcryptjs');

const fetchAllUsers =  async () =>(
    await prisma.user.findMany()
)


fetchAllUsers().then(   
    (data) => {
        console.log(data);
        console.log(fa)
    }
).catch(
    (error) => {
        console.error(error);
    }
);





