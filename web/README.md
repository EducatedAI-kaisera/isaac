# Isaac Editor

Contrary to best practices the env vars are already in the .env files.

## Connecting to Remote PostgreSQL Database via SSH Tunnel

To connect your local application to the PostgreSQL database on our test server, you'll need to set up an SSH tunnel. This creates a secure connection between your local machine and the remote server.

### Step 1: Generate SSH Key

First, generate an SSH key on your local machine. Open your terminal and run:

```
ssh-keygen
```

Follow the on-screen prompts to complete the process.

### Step 2: Display and Send SSH Key

Next, display the generated public SSH key by running:

```
cat ~/.ssh/id_rsa.pub
```

Copy the output and send it to Eimen for adding it to the authorized keys on the test server.

### Step 3: Create SSH Tunnel

Once your SSH key is authorized, create an SSH tunnel to connect your local application to the PostgreSQL database on the test server. Run the following command in your terminal:

```
ssh -N -L 5432:localhost:5432 root@213.239.216.142
```
