function checkTrack(headerID = "", videoID = "", audioID = "", room = "", board) {
    const header = document.createElement("h1")
    header.id = headerID
    header.textContent = room
    board.appendChild(header)

    const localVideoDiv = document.createElement("div")
    localVideoDiv.style.margin = "10% auto"
    localVideoDiv.style.width = "80%"
    localVideoDiv.style.height = "70vh"

    const videoElement = document.createElement("video")
    videoElement.id = videoID
    videoElement.autoplay = true
    videoElement.style.width = "80%"
    videoElement.style.height = "60vh"
    videoElement.poster = "https://www.gnu.org/graphics/gnu-head-30-years-anniversary.svg"

    const audioElement = document.createElement("audio")
    audioElement.id = audioID
    audioElement.autoplay = true

    const buttonWrapper = document.createElement("div")
    const videoButton = Button("video", "100%", "100%", "1.2rem", "1.5rem")
    const micButton = Button("mic", "100%", "100%", "1.2rem", "1.5rem")
    const joinButton = Button("join", "100%", "100%", "1.2rem", "1.5rem")

    buttonWrapper.style.display = "flex"
    buttonWrapper.style.justifyContent = "space-evenly"
    // buttonWrapper.appendChild(videoButton)
    // buttonWrapper.appendChild(micButton)
    buttonWrapper.appendChild(joinButton)

    localVideoDiv.appendChild(videoElement)
    localVideoDiv.appendChild(audioElement)
    localVideoDiv.appendChild(buttonWrapper)
    localVideoDiv.style.marginBottom = "3rem"

    board.appendChild(localVideoDiv)
    const remoteDiv = document.createElement("div")
    remoteDiv.id = "remote-div"
    const headerRemote = document.createElement("h1")
    headerRemote.id = "remote"

    board.appendChild(headerRemote)

    remoteDiv.style.display = "flex"
    board.appendChild(remoteDiv)
    return { header, videoElement, videoButton, micButton, joinButton, board }
}

export function remoteTrackComponent(headerID = "", videoID = "", audioID = "", board) {
    const header = document.createElement("h1")
    header.id = headerID
    header.innerText = headerID

    const remoteDiv = document.createElement("div")
    remoteDiv.style.width = "60%"
    remoteDiv.style.height = "40vh"

    const videoElement = document.createElement("video")
    videoElement.id = videoID
    videoElement.autoplay = true
    videoElement.style.width = "100%"

    const audioElement = document.createElement("audio")
    audioElement.id = audioID
    audioElement.autoplay = true

    remoteDiv.appendChild(header)
    remoteDiv.appendChild(videoElement)
    remoteDiv.appendChild(audioElement)
    remoteDiv.style.margin = "0 1rem"
    board.appendChild(remoteDiv)
    return { videoElement, audioElement, remoteDiv }
}

function roomNameForm() {
    const form = document.createElement("form")
    const room = inputWithLabel("text", "room", "room", "Room name:", "", "", "")
    const name = inputWithLabel("text", "name", "name", "Name:", "", "", "")
    const submit = Input("submit", "", "", "Submit")
    form.appendChild(room)
    form.appendChild(name)
    form.appendChild(submit)
    return form
}

function Button(name = "", height = "0", width = "0", padding = "0", margin = "0") {
    const button = document.createElement("button")
    button.innerText = name
    button.style.width = width
    button.style.padding = padding
    button.style.margin = margin
    return button
}

function Input(type = "text", id = "", name = "", value = "", required = false, placeholder = "") {
    const input = document.createElement("input")
    input.type = type
    input.id = id
    input.name = name
    input.value = value
    input.placeholder = placeholder
    if (required)
        input.required = required
    return input
}

function inputWithLabel(type = "", id = "", name = "", text = "", divStyle = "", labelStyle = "", inputStyle = "") {
    const div = document.createElement("div")
    const input = Input(type, id, name)
    const label = document.createElement("label")

    label.htmlFor = id
    label.innerText = text
    if (divStyle)
        div.setAttribute("style", divStyle)
    if (inputStyle)
        input.setAttribute("style", inputStyle)
    if (labelStyle)
        label.setAttribute("style", labelStyle)

    div.appendChild(label)
    div.appendChild(input)

    return div
}

export { checkTrack, Input, roomNameForm }