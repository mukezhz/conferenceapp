import * as typegoose from "@typegoose/typegoose"
import * as schema from "../schema"

export const StreamModel = typegoose.getModelForClass(schema.StreamSchema);