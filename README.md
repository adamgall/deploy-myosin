# Create Myosin on Base

This codebase implements a script which deploys the Myosin organization on Base.

## Installation

1. Use correct Node version: `nvm use`
2. Install packages: `npm install`
3. Set up config: `cp .env.example .env`
   1. Edit your `.env` appropriately
4. Create a file called `./src/data.ts` which exports an object of type `Data` (see `./src/interfaces.ts`)

## Usage

IMPORTANT! Configure your environment using the `.env` file before running the script.

If your `PRIVATE_KEY` is not set or malformed, a simulation transaction will be executed instead of the real thing.

Run the script with `npx tsx src`

## Intention

TODO

## Testing

TODO
