import React, { useEffect, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import "./App.css";
import { contractAddress, contractABI } from "./contract";

function App() {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [newDescription, setNewDescription] = useState("");
  const [newDuration, setNewDuration] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      if (!window.ethereum) {
        console.log("Make sure you have Metamask installed!");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        setCurrentAccount(accounts[0]);
        await fetchProposals();
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        alert("Get Metamask!");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setCurrentAccount(accounts[0]);
      await fetchProposals();
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProposals = async () => {
    try {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);

      const counter = await contract.proposalCounter();
      const proposalsArray = [];

      for (let i = 0; i < counter; i++) {
        const proposal = await contract.getProposal(i);
        proposalsArray.push(proposal);
      }

      setProposals(proposalsArray);
    } catch (error) {
      console.log(error);
    }
  };

  const createProposal = async () => {
    try {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);

      const tx = await contract.createProposal(newDescription, Number(newDuration));
      await tx.wait();
      alert(`Proposal created! View on Etherscan:\nhttps://sepolia.etherscan.io/tx/${tx.hash}`);


      setNewDescription("");
      setNewDuration("");
      fetchProposals();
    } catch (error) {
      console.log(error);
      alert("Error creating proposal.");
    }
  };

  const voteOnProposal = async (id) => {
    try {
      if (!window.ethereum) return;

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractABI, signer);

      const tx = await contract.vote(id);
      await tx.wait();
      alert(`Vote cast! View on Etherscan:\nhttps://sepolia.etherscan.io/tx/${tx.hash}`);


      fetchProposals();
    } catch (error) {
      console.log(error);
      alert("Error voting on proposal.");
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <h1>Voting DApp</h1>
      <p>
        <a
    href={`https://sepolia.etherscan.io/address/${contractAddress}`}
    target="_blank"
    rel="noopener noreferrer"
        >
    View Contract on Etherscan
        </a>
      </p>
      {!currentAccount ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <>
          <p>Connected account: {currentAccount}</p>

          <h2>Create New Proposal</h2>
          <input
            type="text"
            placeholder="Proposal description"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
          />
          <button onClick={createProposal}>Create Proposal</button>

          <h2>Proposals</h2>
          {proposals.length === 0 ? (
            <p>No proposals found.</p>
          ) : (
            proposals.map((p, index) => (
              <div key={index} style={{ border: "1px solid #ccc", margin: "10px", padding: "10px" }}>
                <p><strong>ID:</strong> {p.id.toString()}</p>
                <p><strong>Description:</strong> {p.description}</p>
                <p><strong>Votes:</strong> {p.voteCount.toString()}</p>
                <p><strong>Active:</strong> {p.active ? "Yes" : "No"}</p>
                {p.active && (
                  <button onClick={() => voteOnProposal(p.id)}>Vote</button>
                )}
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}

export default App;
