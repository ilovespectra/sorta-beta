"use client";
import Image from "next/image";

export default function Home() {
  // const exampleCommand = `npx --max-old-space-size=4096 ts-node --esm sorta.ts /path/to/source /path/to/destination`;
  const exampleCommandByName = `npx --max-old-space-size=4096 ts-node --esm sorta-by-name.ts /path/to/source /path/to/destination/screenshots`;
  // const exampleCreateMetaData = `npx ts-node --esm create-metadata.ts /path/to/source /path/to/this/github/repo/src/app/pages/api/file_metadata.json`;
  // const exampleSortaPics = `npx --max-old-space-size=4096 ts-node --esm sorta-pics.ts /path/to/source /path/to/destination`;
  const diskUtil = ` diskutil list`;
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Command copied to clipboard!");
    } catch (error) {
      alert("Failed to copy command. Please try again.");
      console.error(error);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#1e1e1e",
        color: "#f5f5f5",
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
        padding: "20px",
      }}
    >
      {/* Logo Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <Image
          src="/sorta.png"
          alt="Sorta Logo"
          width={150}
          height={150}
        />
      </div>

      <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
        Sorta: File Organizer
      </h1>

      {/* Description Section */}
      <div
        style={{
          backgroundColor: "#2d2d2d",
          padding: "15px",
          maxWidth: "80vh",
          borderRadius: "5px",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.5)",
          margin: "auto", // Center horizontally
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <h2 style={{ marginBottom: "10px" }}>What Does Sorta Do?</h2>
        <p>
          Sorta is a simple, secure, and efficient file organization script
          designed to help you tidy up your drives and folders. It scans the
          source folder you specify, along with all its subfolders, to organize
          files into your destination folder based on their types.
        </p>
        <p>
          Sorta searches all folders and subfolders at the specified source and 
          copies all files into folders based on file type, leaving the originals 
          in their place, and creating an all-in-one location for each file type 
          at the new destination. 
        </p>
        <p>
          <strong>Your Security Comes First:</strong>
        </p>
        <ul style={{ paddingLeft: "20px", margin: "10px 0" }}>
          <li>
            Sorta operates entirely locally on your machine. No files are
            uploaded, and no data is stored anywhere.
          </li>
          <li>There are no backend APIs or external servers involved.</li>
          <li>The script only accesses the folders and files you specify.</li>
        </ul>

        <p>
          With Sorta, you can confidently organize your files knowing your data
          stays private and under your control.
        </p>
      </div>
      
      {/* GitHub Button */}
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <a
          href="https://github.com/ilovespectra/sorta"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#2d2d2d",
            color: "#f5f5f5",
            textDecoration: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "2px solid #61dafb",
            fontWeight: "bold",
            fontSize: "16px",
            transition: "background-color 0.3s, color 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#61dafb";
            e.currentTarget.style.color = "#1e1e1e";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2d2d2d";
            e.currentTarget.style.color = "#f5f5f5";
          }}
        >
          <img
            src="/github-logo-white.png"
            alt="GitHub Logo"
            style={{
              width: "24px",
              height: "24px",
              marginRight: "10px",
            }}
          />
          View on GitHub
        </a>
      </div>
      
      {/* Walkthrough Section */}
      <div style={{ maxWidth: "800px", margin: "0 auto", lineHeight: "1.6" }}>
        <h2>Step-by-Step Guide:</h2>
        <ol>
          <li>
            <strong>Download and Install Dependencies:</strong> Install Node.js and npm by visiting the{" "}
            <a
              href="https://nodejs.org"
              target="_blank"
              style={{ color: "#61dafb" }}
            >
              official Node.js website
            </a>
            . Ensure npm is included.
          </li>
          <li>
            <strong>Locate Your Drives:</strong> Connect the drives you want to
            organize. Use the command below to find their paths:
            <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#2d2d2d",
            padding: "10px",
            borderRadius: "5px",
            marginTop: "10px",
            color: "#f8f8f2",
          }}
        >
          <code style={{ flex: 1 }}>{diskUtil}</code>
          <button
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              backgroundColor: "#61dafb",
              color: "#1e1e1e",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
            onClick={() => handleCopy(diskUtil)}
          >
            Copy
          </button>
        </div>
            Identify the paths, such as /Volumes/YourDriveName.
          </li>
          <li>
            <strong>Setup Your Configuration:</strong> Rename `template.env` to `.env` and add your values to the newly renamed `.env` file.
          </li>
          <li>
            <strong>Navigate to the API Directory:</strong> Go to `/src/app/pages/api` in this repository.
          </li>
          <li>
            <strong>Run the Command:</strong> Execute the command below to run the script:
            <div
              style={{
                display: "flex",
                alignItems: "center",
                backgroundColor: "#2d2d2d",
                padding: "10px",
                borderRadius: "5px",
                marginTop: "10px",
                color: "#f8f8f2",
              }}
            >
              <code style={{ flex: 1 }}>npm run sorta</code>
              <button
                style={{
                  marginLeft: "10px",
                  padding: "5px 10px",
                  backgroundColor: "#61dafb",
                  color: "#1e1e1e",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer",
                }}
                onClick={() => handleCopy("npm run sorta")}
              >
                Copy
              </button>
            </div>
          </li>
          <li>
            <strong>Verify the Results:</strong> Check the destination folder to ensure the files have been organized correctly.
          </li>
        </ol>

        <h2>1.2 Sorta by Name</h2>
        <p>Additionally, you can use the `sorta-by-name.ts` script to organize by text present in file names (e.g., &apos;Screenshot&apos;).</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#2d2d2d",
            padding: "10px",
            borderRadius: "5px",
            marginTop: "10px",
            color: "#f8f8f2",
            marginBottom: "20px"
          }}
        >
          <code style={{ flex: 1 }}>{exampleCommandByName}</code>
          <button
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              backgroundColor: "#61dafb",
              color: "#1e1e1e",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
            onClick={() => handleCopy(exampleCommandByName)}
          >
            Copy
          </button>
        </div>
        
        {/* <h2>1.3 Sorta Pics</h2>
        <p>This script is for organizing just image files. Set your desired source and destination folder in the `sorta-pics.ts` script.</p>
        <ul>
          <li>
            Create a metadata file using the desired source and this repository as the destination directory for `file_metadata.json`.
          </li>
        </ul>
        <p>Create Metadata File</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#2d2d2d",
            padding: "10px",
            borderRadius: "5px",
            marginTop: "10px",
            color: "#f8f8f2",
            marginBottom: "20px"
          }}
        >
          <code style={{ flex: 1 }}>{exampleCreateMetaData}</code>
          <button
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              backgroundColor: "#61dafb",
              color: "#1e1e1e",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
            onClick={() => handleCopy(exampleCreateMetaData)}
          >
            Copy
          </button>
        </div>
        
        <p>Run</p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#2d2d2d",
            padding: "10px",
            borderRadius: "5px",
            marginTop: "10px",
            color: "#f8f8f2",
            marginBottom: "20px"
          }}
        >
          <code style={{ flex: 1 }}>{exampleSortaPics}</code>
          <button
            style={{
              marginLeft: "10px",
              padding: "5px 10px",
              backgroundColor: "#61dafb",
              color: "#1e1e1e",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer",
            }}
            onClick={() => handleCopy(exampleSortaPics)}
          >
            Copy
          </button>
        </div> */}
      </div>
    </div>
  );
}
