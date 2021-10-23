// check the correct way of passing the data
// button tag, input tag, form elements ? 
// there was a comment written to you
// about this in github kanban final

const btn1 = document.querySelector('.btn1')
const btn2 = document.querySelector('.btn2')
const arrayOfButtons = [document.querySelector('.btn1'), document.querySelector('.btn2')]
const arrayOfDropDown = [document.querySelector('.dropdown-menu1'), document.querySelector('.dropdown-menu2')]
// btn2.classList.remove('d-none')

const display = document.querySelector('.display')
const searchBar = document.querySelector('.search-bar')
const searchButton = document.querySelector('.search-button')
searchButton.addEventListener('click', () => {
    fetchPokemon(searchBar.value)
})
searchBar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') fetchPokemon(searchBar.value)
})

const fetchPokemon = async (pokemon) => { // fetch num 1
    try {
    // const res = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`)
    // if you're using axios data will be equal response.data
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.toLowerCase()}`)
    const data = await response.json()
    const {name, height, weight, sprites, types} = data
    const [n, h, w, i, t] = [name, height, weight, sprites, types] // [0].type.name

    let typeList
    if (t.length < 2) {
        typeList = await fetchTypeList(t[0].type.name)
    } else {
        typeList = await fetchTypeList(t[0].type.name, t[1].type.name)
    }
    display.append( 
    createElement(n, 'div', data),
    createElement(h, 'div', data),
    createElement(w, 'div', data),
    createElement(i.front_default, 'img', data),
    createElement(t, 'div', typeList))
    } catch (error) {
    display.textContent = '' // In case of a pokemon already appearing on the page, this deletes it from display
    console.log(error);
    alert('Wrong pokemon name/number \nTry again');
    }
}
// fetchPokemon('charizard')
function createElement (pokemonData, typeOfElement, apiData) {
    display.textContent = ''

    let types = ''
    let property

    for (const key in apiData) {
        if (apiData[key] === pokemonData) property = key[0].toUpperCase() + key.slice(1)
        
    }
    
    const element = document.createElement(typeOfElement)
    
    arrayOfButtons.forEach(btn => {
        if (![...btn.classList].includes('d-none')) btn.classList.toggle('d-none')
    })

    if (!property && typeof pokemonData !== 'string') { // this is only for types ? Think so
        property = 'Types'
        pokemonData.forEach((obj, i) => {
            arrayOfButtons[i].classList.remove("d-none")
            arrayOfButtons[i].textContent = obj.type.name

            arrayOfDropDown[i].textContent = ''

            if (typeof apiData[0] === 'string') {
                apiData.forEach(pokemon => {
                    arrayOfDropDown[i].append(createDropDownContent(pokemon))
                })
            } else {
                for (let j = 0; j < apiData.length; j++) {
                    apiData[j].forEach(pokemon => {
                        arrayOfDropDown[j].append(createDropDownContent(pokemon))
                    })
                }
            }
        })
    }
    else if (typeOfElement === 'img') {
        element.src = pokemonData
        element.alt = apiData.sprites.back_default // back default
        element.addEventListener('mouseover', hoverOverImage)
        element.addEventListener('mouseleave', hoverOverImage)
        // element.addEventListener('click', () => {
        //     getEvolution(apiData.id) // or apiData.name
        // })
    } else {
        if (property === 'Name') {
            element.classList.add('name')
            element.textContent = pokemonData[0].toUpperCase() + pokemonData.slice(1)
        } else {
            element.textContent = `${property}: ${pokemonData}`
        }
        element.classList.add('info')
    }

    // img.addEventListener('mouseover', hoverOverImage)
    if (types)  {
        element.textContent = `${property}:` //  ${types}
    }
    return element
}

const hoverOverImage = (e) => {
    const src = e.target.src
    const alt = e.target.alt
    e.target.setAttribute('src', alt)
    e.target.setAttribute('alt', src)
    return
}

const getEvolution = async (pokemon) => { // Finish this function later. // fetch num 2
    // use pokemon species prop in API
    // const pokemon = event.target.src.split('back/')[1].split('.png')[0]
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon}`)
    const data = await response.json()
    const evolved = data.chain.evolves_to[0].species.name // find more efficient way plz
    return evolved
}

const createDropDownContent = (pokemon) => {
    const aTag = document.createElement('a')
    aTag.setAttribute('class', 'dropdown-item')
    aTag.setAttribute('href', '#')
    aTag.textContent = pokemon
    return aTag
}

const fetchTypeList = async (type, type2) => {
    let responseOfTypes2

    const responseOfTypes = await axios.get(`https://pokeapi.co/api/v2/type/${type}`)
    const listOfType = responseOfTypes.data.pokemon
    const allPokemonInType = listOfType.map(arr => arr.pokemon.name)
    if (!type2) {
        return allPokemonInType
    } else {
        responseOfTypes2 = await axios.get(`https://pokeapi.co/api/v2/type/${type2}`)
        const listOfType2 = responseOfTypes2.data.pokemon
        const allPokemonInType2 = listOfType2.map(arr => arr.pokemon.name)
        return [allPokemonInType, allPokemonInType2]
    }
}

const changePokemon = (event) => {
    console.log(event.target.textContent);
} 

arrayOfDropDown.forEach(dropdown => {
    dropdown.addEventListener('click', (e) => {
        fetchPokemon(e.target.textContent)
    })
})
