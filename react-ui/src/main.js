import React from 'react';
export default class extends React.Component 
{

    constructor(props)
    {
        super(props);

        this.state = {selfEasyrtcid:"",haveSelfVideo:false,onceOnly:true,callerPending:null};
        
        this.addSinkButton = this.addSinkButton.bind(this);
        this.clearConnectList = this.clearConnectList.bind(this);
        this.convertListToButtons = this.convertListToButtons.bind(this);
        this.setUpMirror= this.setUpMirror.bind(this);
        this.performCall = this.performCall.bind(this);
        this.loginSuccess = this.loginSuccess.bind(this);
        this.loginFailure = this.loginFailure.bind(this);
        this.disconnect = this.disconnect.bind(this);
        this.passone = this.passone.bind(this);
        this.passtwo = this.passtwo.bind(this);
        this.passthree = this.passthree.bind(this);
        this.passfour = this.passfour.bind(this);
    }

    componentDidMount()
    {
        if(window.DetectRTC.isWebRTCSupported === true && window.DetectRTC.isWebSocketsSupported === true)
        {
                if(window.DetectRTC.browser.name === 'Chrome' || window.DetectRTC.browser.name === 'Edge' || window.DetectRTC.browser.name === 'Firefox' || window.DetectRTC.browser.name === 'Opera')
                {
                            if(window.DetectRTC.browser.isPrivateBrowsing === false)
                            {
                            alert('You are connected to server');
                            window.easyrtc.setStreamAcceptor(this.passone);
                            window.easyrtc.setOnStreamClosed(this.passtwo);
                            window.easyrtc.setCallCancelled(this.passthree);
                            window.easyrtc.setAcceptChecker(this.passfour);
                            this.connect();
                            }
                            else
                            {
                            alert('You are running in incognito mode');
                            document.getElementById("container").innerHTML = "<h1>Your Browser is running in incognito mode</h1>";
                            document.getElementById("container").innerHTML += "<h1>Please turn off incognito mode</h1>";
                            }
                }
                else
                {
                    alert("Your Browser Does not support WebRTC");
                    document.getElementById("container").innerHTML = "<h1>Your Browser Does not support WebRTC</h1>";
                    document.getElementById("container").innerHTML += "WebRTC is supported in chrome , opera , firefox and edge";
                }  
        }
        else
        {
            alert("Your Browser Does not support WebRTC");
            document.getElementById("container").innerHTML = "<h1>Your Browser Does not support WebRTC</h1>";
            document.getElementById("container").innerHTML += "WebRTC is supported in chrome , opera , firefox and edge";
        }
    }

    outside(list) {
        for(let ele of list ) {
            this.addSinkButton(ele.label, ele.deviceId);
        }
     };
    
    connect() {
      window.easyrtc.setSocketUrl("https://easyrtcvid.herokuapp.com/");	
      window.easyrtc.enableAudio(true);
      window.easyrtc.enableVideo(true);
      window.easyrtc.enableDataChannels(true);
      window.easyrtc.setRoomOccupantListener( this.convertListToButtons);    
      window.easyrtc.connect("window.easyrtc.audioVideo", this.loginSuccess, this.loginFailure);			  
      if( this.state.onceOnly ) {
          window.easyrtc.getAudioSinkList(this.outside)
         this.setState({onceOnly:true});
      }
      document.getElementById("connect").style.display ='none';
    } 
    
    addSinkButton(label, deviceId){
       let button = document.createElement("button");
       button.innerText = label?label:deviceId;
       button.onClick = () => {window.easyrtc.setAudioOutput( document.getElementById("callerVideo"), deviceId);};
       document.getElementById("audioSinkButtons").appendChild(button);
    }
    
    
    clearConnectList() {
        var otherClientDiv = document.getElementById('otherClients');
        while (otherClientDiv.hasChildNodes()) {
            otherClientDiv.removeChild(otherClientDiv.lastChild);
        }
    }
    
    
    convertListToButtons (roomName, occupants, isPrimary) {
        this.clearConnectList();
        var otherClientDiv = document.getElementById('otherClients');
        for(var easyrtcid in occupants) {
            var button = document.createElement('button');
            button.onclick = this.performCall.bind(this,easyrtcid);
            button.id = easyrtcid;
            var label = document.createTextNode("Call " + window.easyrtc.idToName(easyrtcid));
            button.appendChild(label);
            otherClientDiv.appendChild(button);
        }
    }
    
    
    setUpMirror() {
        if( !this.state.haveSelfVideo) {
            var selfVideo = document.getElementById("selfVideo");
            window.easyrtc.setVideoObjectSrc(selfVideo, window.easyrtc.getLocalStream());
            selfVideo.muted = true;
            this.setState({haveSelfVideo:true});
        }
    }
    
    acceptedCB(accepted, easyrtcid) {
    };

    successCB() {
        if( window.easyrtc.getLocalStream()) {
            this.setUpMirror;
        }
    };

    failureCB () {
    };

    performCall(otherEasyrtcid) {

        window.easyrtc.hangupAll();
        
        var acceptedCB = this.acceptedCB;
    
        var successCB = this.successCB;

        var failureCB = this.failureCB;

        window.easyrtc.call(otherEasyrtcid, successCB, failureCB, acceptedCB);
        

    }
    
    loginSuccess(easyrtcid) {
        document.getElementById("iam").innerHTML = "Your ID Is : " + window.easyrtc.cleanId(easyrtcid);
        document.getElementById("hangupButton").style.display ='inline-block';
    }
    
    
    loginFailure(errorCode, message) {
        window.easyrtc.showError(errorCode, message);
    }
    
    null(){}

    disconnect() {
      window.easyrtc.disconnect();			  
      document.getElementById("iam").innerHTML = "logged out";
      window.easyrtc.clearMediaStream( document.getElementById('selfVideo'));
      window.easyrtc.setVideoObjectSrc(document.getElementById("selfVideo"),"");
      window.easyrtc.closeLocalMediaStream();
      window.easyrtc.setRoomOccupantListener(this.null);  
      document.getElementById("hangupButton").style.display ='none';
      document.getElementById("connect").style.display ='inline-block';
      this.clearConnectList();
    } 
    
    passone(easyrtcid, stream) {
            this.setUpMirror();
            var video = document.getElementById('callerVideo');
            window.easyrtc.setVideoObjectSrc(video,stream);
            document.getElementById("hangupButton").style.display = 'inline-block';
        }
    
    passtwo(easyrtcid) {
            window.easyrtc.setVideoObjectSrc(document.getElementById('callerVideo'), "");
        }
    
    passthree(easyrtcid){
            if( easyrtcid === this.state.callerPending) {
                this.setState({callerPending:false});
            }
        }

    passfour(easyrtcid, callback) {
            
            this.setState({callerPending :easyrtcid});
            let check = window.confirm("Accept incoming call from " + window.easyrtc.idToName(easyrtcid) + " ?");
            if(check === true)
            {
                this.acceptTheCall(true,easyrtcid);
            }
            else
            {
                this.acceptTheCall(false,easyrtcid);
            }
        }


    acceptTheCall(wasAccepted,easyrtcid){
            if( wasAccepted && window.easyrtc.getConnectionCount() > 0 ) {
                window.easyrtc.hangupAll();
            }
            this.callback(wasAccepted,easyrtcid);
            this.setState({callerPending:null});
        };

    callback(wasAccepted,easyrtcid)
    {
        if(wasAccepted === true)
        {
            this.performCall(easyrtcid);
        }
    }

    render()
    {
        return(
        
        <main>


            <div id="container">
                    <div id="main">
                        <div id="demoContainer">
                            <div id="connectControls">
                                <button id="connect" style={{display:'none'}} onClick={this.connect.bind(this)}>Connect</button>
                                <button id="hangupButton" style={{display:'none'}} onClick={this.disconnect}>Disconnect</button>
                                <div id="iam">Not yet connected...</div>
                                <br />
                                <strong id="callingTo">Connected users:</strong>
                                <div id="otherClients"></div>
                            </div>
                            <hr/>
                            <hr/>
                            <div id="videos">
                                <video autoPlay="autoplay" id="selfVideo" muted="muted" className="col-lg-6 col-md-6 col-sm-6 col-xs-6" volume="0"></video>
                                <video autoPlay="autoplay" id="callerVideo" className="col-lg-6 col-md-6 col-sm-6 col-xs-6" ></video>
                            </div>
                            <div id="audioSinkButtons">
                            </div>
                        </div>
                    </div>
            </div>
            
            
        </main>
            
        )
    }
}