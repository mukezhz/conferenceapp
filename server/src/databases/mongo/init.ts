import * as mongoose from "mongoose"


export const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '')
        console.error("Mongoose Connected");
    } catch (error) {
        console.error("Mongoose Error", error);
    }
}
