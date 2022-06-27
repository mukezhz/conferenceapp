export function checkNameRoom(room = "", name = "") {
    let message = "";
    let status = true;
    if (!room && !name) {
        message = "room and name both are not provided"
        status = false
    } else if (!room) {
        message = "room is not provided"
        status = false
    } else if (!name) {
        message = "name is not provided"
        status = false
    }
    return { status, message }
}

export async function asyncForEach(array: Array<any>, callback: Function) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}