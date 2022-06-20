import * as mongoose from "mongoose"


export const connectDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || '')
        console.log("Mongoose Connected");
    } catch (error) {
        console.log("Mongoose Error", error);
    }
}
