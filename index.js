const cheerio = require('cheerio');
const request = require('request')
const URL = 'https://en.wikipedia.org/wiki/2022_FIFA_World_Cup_squads'

request(URL, function(error, response, body) {
    if(error) { return  console.error('There was an error!') }

    let playerDataMap = {}

    const $ = cheerio.load(body)

    $("table").toArray().forEach(e1 =>
        $(e1).find("tr").toArray().forEach(e2 =>
            $(e2).find("td:nth-child(4) > span > span").toArray().forEach(e3 => {
                // Find the nearest h3 above the table and a span inside it with class .mw-headline. The id of this contains the country name.
                const currentCountry = $(e1).prev().prevUntil('h2').find(".mw-headline").attr('id')

                // Find current player name from the same row, it is of th type instead of tr, don't know why
                const currentPlayer = $(e2).find("th:nth-child(3) > a").text()

                // Current date is already found in e3
                const currentDate = $(e3).text()

                playerDataMap[currentCountry] = playerDataMap[currentCountry] || []
                playerDataMap[currentCountry].push({
                    name: currentPlayer,
                    birthDate: currentDate
                })
            })
        )
    )

    let count = 0;
    for (const country in playerDataMap) {
        let foundMultiple = false;
        let birthDateMap = {};
        playerDataMap[country].forEach(obj => {
            birthDateMap[obj['birthDate']] = birthDateMap[obj['birthDate']] || []
            birthDateMap[obj['birthDate']].push(obj['name'])
        })
        for (birthDate in birthDateMap) {
            if (birthDateMap[birthDate].length > 1){
                // If more than 1 name present for a birthdate and a country, print it.
                console.log(country + " has multiple birthdays on " + birthDate + ". Player Names - " + birthDateMap[birthDate].join(', '))
                if (!foundMultiple) {
                    // increase count for final answer
                    count++;
                }
                foundMultiple = true;
            }
        }
    }

    console.log(count + " countries out of " + Object.keys(playerDataMap).length  + " have at least 2 players who share the same birthday.")
});

