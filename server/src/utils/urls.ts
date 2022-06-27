const env = process.env.NODE_ENV || "production"
let urls: { [key: string]: string }
if (env === "production") {
    urls = {
        np: "wss://chautari-server.hamropatro.com",
    }
} else {
    urls = {
        np: "wss://chautari-server.alpha.hamrostack.com",
    }
}
export { urls }