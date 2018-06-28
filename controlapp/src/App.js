import React, { Component } from "react";
import socketIOClient from "socket.io-client";
class App extends Component {
    constructor() {
        super();
        this.state = {
            response: false,
            endpoint: "/"
        };
    }
    componentDidMount() {
        const { endpoint } = this.state;
        this.socket = socketIOClient(endpoint);
        this.socket.on("FromAPI", data => this.setState({ response: data }));
    }
    render() {
        const { response } = this.state;
        const socket = this.socket;
        console.log(response);
        return (
            <div style={{ textAlign: "center",display:"flex",flexDirection:"column" }}>
                {response
                    ? response.data.map((r,i) => 
                    <button key={i} style={{ height: "50px", width: "200px", backgroundColor: "green"}} onClick={()=>{
                        console.log("Selected",r.url);
                        socket.emit("switchChannel", r.url);
                    }}>
                        <p>{r.name}</p>
                    </button>)
                    : <p>Loading...</p>}
            </div>
        );
    }
}
export default App;