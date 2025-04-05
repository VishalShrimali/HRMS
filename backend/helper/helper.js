import bcrypt from 'bcrypt';

export class encrypt {
    static comparePassword(hashPassword, password) {
        return bcrypt.compareSync(password, hashPassword);
    }
}