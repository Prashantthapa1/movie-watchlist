import bcrypt from 'bcrypt';

// const password = "adminA123";
const password = "amin123A";
async function run() {
 const hashedPassword = await bcrypt.hash(password, 12);
console.log(hashedPassword);
}

run();
