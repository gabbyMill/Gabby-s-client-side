const welcome = document.querySelector(".welcome");
const btn1 = document.querySelector(".btn1");
const btn2 = document.querySelector(".btn2");
const btn3 = document.querySelector(".btn3");
const arrayOfButtons = [
  document.querySelector(".btn1"),
  document.querySelector(".btn2"),
];
const arrayOfDropDown = [
  document.querySelector(".dropdown-menu1"),
  document.querySelector(".dropdown-menu2"),
  document.querySelector(".dropdown-menu3"),
];

const display = document.querySelector(".display");
const searchBar = document.querySelector(".search-bar");
const userName = document.querySelector(".username");
const searchButton = document.querySelector(".search-button");
searchButton.addEventListener("click", () => {
  fetchPokemon(searchBar.value, userName.value);
});
searchBar.addEventListener("keydown", e => {
  if (e.key === "Enter") fetchPokemon(searchBar.value, userName.value);
});
userName.addEventListener("keydown", e => {
  if (e.key === "Enter") fetchPokemon(searchBar.value, userName.value);
});

const fetchPokemon = async (pokemon, username, flag) => {
  try {
    const catchButton = document.querySelector(".catch");
    if (catchButton) {
      if ([...catchButton.classList].includes("caught")) {
        catchButton.classList.remove("caught");
      }
    }
    welcome.classList.remove("alert");
    welcome.textContent = `Good to see you ${username}\nEnjoy the Pokédex`;
    let lowerCaseOrNumber;
    if (!+pokemon) {
      lowerCaseOrNumber = pokemon.toLowerCase();
    } else {
      lowerCaseOrNumber = pokemon;
    }
    const res = await axios.get(
      `http://localhost:3000/pokemon/get/${lowerCaseOrNumber}`,
      {
        headers: {
          "Content-Type": "application/json", // content type caps or not ?
          username,
        },
      }
    );

    if (![...arrayOfDropDown[2].classList].includes("displaying")) {
      fillCaughtDropDown(res.data.id, userName.value);
    }

    const {
      name: n,
      height: h,
      weight: w,
      types: t,
      back_pic,
      front_pic,
    } = res.data; // sprites
    // check if this user has this pokemon:

    let typeList;
    if (t.length < 2) {
      typeList = await fetchTypeList(t[0].name);
    } else {
      typeList = await fetchTypeList(t[0].name, t[1].name);
    }
    if (!document.querySelector(".catch")) {
      document
        .querySelector(".buttons")
        .append(
          createElement("catch", "button", [res.data, username]),
          createElement("release", "button", [res.data, username])
        );
    }
    display.append(
      createElement(n, "div", res.data),
      createElement(h, "div", res.data),
      createElement(w, "div", res.data),
      createElement(front_pic, "img", res.data),
      createElement(t, "div", typeList)
    );
    // setTimeout(() => {
    const dropdown3 = document.querySelector(".dropdown-menu3");
    const children = dropdown3.children;
    for (let i = 0; i < children.length; i++) {
      if (children[i].textContent === n) {
        console.log("equals to n");
      }
    }
    // }, 500);
  } catch (error) {
    display.textContent = ""; // In case of a pokemon already appearing on the page, this deletes it from display
    console.log(error);
    welcome.classList.add("alert");
    welcome.textContent = "Wrong pokemon name/number \nTry again";
  }
};

async function catchOrRelease(e, id, username) {
  // username is not helping here
  // id is unnecessary but it is not good practice to take data from the dom as i am doing here
  // add functionality that adds class caught if pokemon is caught when switching between pokemon
  if ([...e.target.classList].includes("catch")) {
    e.target.classList.add("caught");
    const pokemonName = await axios.get(
      `http://localhost:3000/pokemon/get/${searchBar.value}`,
      {
        headers: {
          "Content-Type": "application/json", // content type caps or not ?
          username: userName.value,
        },
      }
    );
    const res = await axios.put(
      `http://localhost:3000/pokemon/catch/${"" + searchBar.value}`,
      { pokemon: { pokemonName: pokemonName.data.name } },
      {
        headers: {
          "Content-Type": "application/json", // content type caps or not ?
          username: userName.value,
        },
      }
    );

    fillCaughtDropDown(id, userName.value);
  } else {
    document.querySelector(".catch").classList.remove("caught");
    const res = await axios.delete(
      `http://localhost:3000/pokemon/release/${"" + id}`,
      {
        headers: {
          "Content-Type": "application/json", // content type caps or not ?
          username,
        },
      }
    );
  }
}

function createElement(pokemonData, typeOfElement, apiData) {
  display.textContent = "";
  let types = "";
  let property;

  for (const key in apiData) {
    if (apiData[key] === pokemonData)
      property = key[0].toUpperCase() + key.slice(1);
  }

  const element = document.createElement(typeOfElement);

  arrayOfButtons.forEach(btn => {
    if (![...btn.classList].includes("d-none")) btn.classList.toggle("d-none");
  });

  if (!property && typeof pokemonData !== "string") {
    btn3.classList.remove("d-none"); // add caught pokemon here
    btn3.textContent = "Caught";

    property = "Types";
    pokemonData.forEach((obj, i) => {
      arrayOfButtons[i].classList.remove("d-none");
      arrayOfButtons[i].textContent = obj.name;

      if (typeof apiData[0] === "string") {
        apiData.forEach(pokemon => {
          arrayOfDropDown[i].append(createDropDownContent(pokemon));
        });
      } else {
        for (let j = 0; j < apiData.length; j++) {
          apiData[j].forEach(pokemon => {
            arrayOfDropDown[j].append(createDropDownContent(pokemon));
          });
        }
      }
    });
  } else if (!property) {
    element.textContent = pokemonData;
    element.classList.add(`info`, pokemonData);
    element.addEventListener("click", async e => {
      catchOrRelease(e, apiData[0].id, apiData[1]);
    });
    document.querySelector(".buttons").append(element);
  } else if (typeOfElement === "img") {
    element.src = pokemonData;
    element.alt = apiData.back_pic; // back default
    element.addEventListener("mouseover", hoverOverImage);
    element.addEventListener("mouseleave", hoverOverImage);
  } else {
    if (property === "Name") {
      element.classList.add("name");
      element.textContent = pokemonData[0].toUpperCase() + pokemonData.slice(1);
    } else {
      element.textContent = `${property}: ${pokemonData}`;
    }
    element.classList.add("info");
  }

  // img.addEventListener('mouseover', hoverOverImage)
  if (types) {
    element.textContent = `${property}:`; //  ${types}
  }
  return element;
}

const hoverOverImage = e => {
  const src = e.target.src;
  const alt = e.target.alt;
  e.target.setAttribute("src", alt);
  e.target.setAttribute("alt", src);
  return;
};

const getEvolution = async pokemon => {
  // Finish this function later. // fetch num 2
  // use pokemon species prop in API
  // const pokemon = event.target.src.split('back/')[1].split('.png')[0]
  const response = await fetch(
    `https://pokeapi.co/api/v2/pokemon-species/${pokemon}`
  );
  const data = await response.json();
  const evolved = data.chain.evolves_to[0].species.name; // find more efficient way plz
  return evolved;
};

const createDropDownContent = pokemon => {
  const aTag = document.createElement("a");
  aTag.setAttribute("class", "dropdown-item");
  aTag.setAttribute("href", "#");
  aTag.textContent = pokemon;
  return aTag;
};

const fetchTypeList = async (type, type2) => {
  let responseOfTypes2;

  const responseOfTypes = await axios.get(
    `https://pokeapi.co/api/v2/type/${type}`
  );
  const listOfType = responseOfTypes.data.pokemon;
  const allPokemonInType = listOfType.map(arr => arr.pokemon.name);
  if (!type2) {
    return allPokemonInType;
  } else {
    responseOfTypes2 = await axios.get(
      `https://pokeapi.co/api/v2/type/${type2}`
    );
    const listOfType2 = responseOfTypes2.data.pokemon;
    const allPokemonInType2 = listOfType2.map(arr => arr.pokemon.name);
    return [allPokemonInType, allPokemonInType2];
  }
};

arrayOfDropDown.forEach(dropdown => {
  dropdown.addEventListener("click", e => {
    fetchPokemon(e.target.textContent);
  });
});

async function fillCaughtDropDown(id, username) {
  if (![...arrayOfDropDown[2].classList].includes("displaying")) {
    arrayOfDropDown[2].textContent = "";
  } else {
    arrayOfDropDown[2].classList.add("displaying");
  }
  // console.log("username: ", username);
  // check which files are in userfolder and display
  const res = await axios.get(`http://localhost:3000/pokemon/`, {
    headers: {
      "Content-Type": "application/json", // content type caps or not ?
      username,
    },
  });
  let caughtArray = [];
  for (let i = 0; i < res.data.length; i++) {
    const result = await axios.get(
      `http://localhost:3000/pokemon/get/${res.data[i]}`,
      {
        headers: {
          "Content-Type": "application/json", // content type caps or not ?
          username,
        },
      }
    );
    caughtArray.push(result.data.name);
  }
  caughtArray.forEach(pokemon => {
    arrayOfDropDown[2].append(createDropDownContent(pokemon));
  });
  return;
}
