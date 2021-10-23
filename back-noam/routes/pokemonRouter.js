const Pokedex = require("pokedex-promise-v2");
const express = require("express");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const router = express.Router();
const p = new Pokedex();

router.get('/getDetailed/:id', async (req,res,next) => {
  const {id} = req.params;

  try {
    const pokemonData = parsePokemon(await p.getPokemonByName(id));

    const abilitiesRes = await Promise.allSettled(pokemonData.abilities.map(async ({name, url}) => {
      const axiosRes = await axios.get(url);
      const pokemonList = axiosRes.data.pokemon.map(({pokemon}) => pokemon.name);
      return {
        name: name,
        list: pokemonList
      }
    }));
    pokemonData.abilities = abilitiesRes.filter(({status}) => status === 'fulfilled').map(({value}) => value);

    const typesRes = await Promise.allSettled(pokemonData.types.map(async ({name, url}) => {
      const axiosRes = await axios.get(url);
      const pokemonList = axiosRes.data.pokemon.map(({pokemon}) => pokemon.name);
      return {
        name: name,
        list: pokemonList
      }
    }));
    pokemonData.types = typesRes.filter(({status}) => status === 'fulfilled').map(({value}) => value);

    res.send(pokemonData);
  } catch (err) {
    if (err.isAxiosError) next({ status: 404, message: "Pokemon not found" });
    else next(err);
  }

});

router.get("/get/:id", async (req, res, next) => {
  const { id } = req.params;

  try {
    const pokemonData = parsePokemon(await p.getPokemonByName(id));
    res.send(pokemonData);
  } catch (err) {
    if (err.isAxiosError) next({ status: 404, message: "Pokemon not found" });
    else next(err);
  }
});

router.get("/query", async (req, res, next) => {
  const { query } = req.body;

  try {
    if (!query) throw { status: 400, message: "Must provide a query" };
    const pokemonData = parsePokemon(await p.getPokemonByName(query));
    res.send(pokemonData);
  } catch (err) {
    if (err.isAxiosError) next({ status: 404, message: "Pokemon not found" });
  }
});

router.put("/catch/:id", (req, res) => {
  const { id } = req.params;
  const { pokemon } = req.body;

  if (Object.entries(pokemon).length === 0)
    throw { status: 400, message: "Must provide pokemon data (JSON)" };

  const { username } = req;

  const filePath = path.resolve(path.join("./users", username, `${id}.json`));
  if (fs.existsSync(filePath))
    throw { status: 403, message: "Already caught that pokemon" };

  fs.writeFileSync(filePath, JSON.stringify(pokemon));
  res.send("Success");
});

router.delete("/release/:id", (req, res) => {
  const { id } = req.params;
  const { username } = req;

  const filePath = path.resolve(path.join("./users", username, `${id}.json`));
  if (!fs.existsSync(filePath))
    throw {
      status: 403,
      message: "You cant release a pokemon you dont have...",
    };

  fs.rmSync(filePath);
  res.send("Success");
});

router.get("/", (req, res) => {
  const { username } = req;

  const userPath = path.resolve(path.join("./users", username));

  const pokemonsDir = fs.readdirSync(userPath);

  const pokemons = pokemonsDir.map((filename) => filename.replace(".json", ""));

  res.send(pokemons);
});

module.exports = router;

function parsePokemon(poke) {
  return {
    id: poke.id,
    name: poke.name,
    height: poke.height,
    weight: poke.weight,
    types: poke.types.map(({ type }) => type),
    front_pic: poke.sprites.front_default,
    back_pic: poke.sprites.back_default,
    abilities: poke.abilities.map(({ ability }) => ability),
  };
}
