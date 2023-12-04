_README.md is a work-in-progress. Please check back later for more updates._

<p align="center">

  <a href="https://isaaceditor.com">
    <img src="assets/isaac-logo.png" alt="Isaac Logo" width="100" height="100">
  
  <h3 align="center">Isaac</h3>
  <p align="center">
    The AI-native, open source research workspace. Accelerating science.

<p align="center">
<a href="https://console.algora.io/org/isaac/bounties?status=open"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Fisaac%2Fbounties%3Fstatus%3Dopen" alt="Open Bounties"></a>
<a href="https://console.algora.io/org/isaac/bounties?status=completed"><img src="https://img.shields.io/endpoint?url=https%3A%2F%2Fconsole.algora.io%2Fapi%2Fshields%2Fisaac%2Fbounties%3Fstatus%3Dcompleted" alt="Rewarded Bounties"></a>

<p align="center">
<a href="https://github.com/aietal/isaac/stargazers"><img src="https://img.shields.io/github/stars/aietal/isaac" alt="Github Stars"></a>
</a>
<a href="https://github.com/aietal/isaac/network/members"><img src="https://img.shields.io/github/forks/aietal/isaac" alt="Github Forks"></a>
<a href="https://github.com/aietal/isaac/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-AGPLv3-blue" alt="License">
</a>

<p align="center">
<a href="https://discord.gg/sJBSV4Fh5k"><img src="https://img.shields.io/discord/1085110924043616286?label=discord" alt="Discord"></a>

## Description

You've stumbled upon the most exciting thing since sliced bread in the world of research and AI. But guess what? Our README is playing catch up with our awesomeness. It's still a work-in-progress, just like the best of us.

We're on a mission to make Isaac the go-to tool for researchers, scientists, and knowledge workers - basically anyone who loves to blend coffee with groundbreaking ideas.

## Installation

1. Fork the repo from [here](https://github.com/aietal/isaac/fork)

2. Clone the forked repo to your local machine

```bash
git clone https://github.com/<your-username>/isaac.git
```

### Setting up Docker image

1. Install [Docker Engine](https://docs.docker.com/engine/install/)

2. Go to api directory

```bash
cd api
```

3. Build docker image

```bash
docker build -t isaac-api .
```

4. Run docker image

```bash
docker run -p 8000:8000 isaac-api
```

### Setting up Web App

1. Go to web directory

```bash
cd web
```

2. Install dependencies

```bash
npm install
```

3. For Production (build)

```bash
npm run build
```

4. For Development (dev)

```bash
npm run dev
```

## Contributing to Isaac

First off, thanks for taking the time to contribute! ❤️

All types of contributions are encouraged and valued. Please read our [Code of Conduct](CODE_OF_CONDUCT.md) and [Contributing Guidelines](CONTRIBUTING.md) to get started.

## Community

Join our [Discord Community](https://discord.gg/sJBSV4Fh5k), if you're interested to make your mark in the annals of research tool history or not.

## License

Isaac is open-source under GNU Affero General Public License Version 3 [(AGPLv3)](https://github.com/aietal/isaac/blob/main/LICENSE)

---


