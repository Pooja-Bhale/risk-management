import React from "react";
import "./Home.css";

export default function Home() {
  
  return (
     <div className="container" style={{ backgroundImage: "url(/risk.png)", backgroundSize: 'cover',} }>

    <div className="Home">
      <div className="lander">
        <h1>Scratch</h1>
        <p  Style="color:white; font-size:20px">A Risk Monitoring Application</p>
      </div>
    </div>
   </div>
  );
}
