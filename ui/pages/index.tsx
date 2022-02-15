import type { NextPage } from "next";
import { useState, useEffect } from "react";

const backUrl = "http://localhost:3001";

const Home: NextPage = () => {
  const [hello, setHello] = useState<string>("nothing");

  useEffect(() => {
    console.log("fetching...", backUrl);
    fetch(backUrl, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        console.log("back data:", data);
        setHello(data);
      });
  }, []);

  return (
    <>
      <h1>Home</h1>
      <p>Hello from back? {hello}</p>
    </>
  );
};

export default Home;
