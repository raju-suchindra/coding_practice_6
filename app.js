const express = require('express')
const path = require('path')
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')

let dataBase = null
const dbpath = path.join(__dirname, 'covid19India.db')

const app = express()
app.use(express.json())

const initializeDbandServer = async () => {
  try {
    dataBase = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log('server logged In')
    })
  } catch (e) {
    console.log(`Db error: ${e.message}`)
    process.exit(1)
  }
}
initializeDbandServer()

const convertObjectAPI_1 = objectItem => {
  return {
    stateId: objectItem.state_id,
    stateName: objectItem.state_name,
    population: objectItem.population,
  }
}

//API-1 get states
app.get('/states/', async (request, response) => {
  statesQuery = `select * from state;`
  statearray = await dataBase.all(statesQuery)
  const ans = statearray => {
    return {
      stateId: statearray.state_id,
      stateName: statearray.state_name,
      population: statearray.population,
    }
  }
  response.send(statearray.map(eachdata => ans(eachdata)))
})

//API-2 get states stateid
app.get('/states/:stateId/', async (request, response) => {
  const {stateId} = request.params
  const stateQuery = `
  select *
  from state
  where state_id = ${stateId};`
  const stateArray = await dataBase.get(stateQuery)
  response.send(convertObjectAPI_1(stateArray))
})

//API-3 post district
app.post('/districts/', async (request, response) => {
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const addNewDetails = ` 
  insert into district (district_name	, state_id ,cases , cured , active,  deaths)
  values ('${districtName}' , '${stateId}' , '${cases}' , '${cured}' , '${active}' , '${deaths}');`
  const resultQuery = await dataBase.run(addNewDetails)
  response.send('District Successfully Added')
})

//API-4 get districts districtsID

const convertDbObjectAPI4 = (objectItem) => {
  return {
    districtId: objectItem.district_id,
    districtName: objectItem.district_name,
    stateId: objectItem.state_id,
    cases: objectItem.cases,
    cured: objectItem.cured,
    active: objectItem.active,
    deaths: objectItem.deaths,
  };
};

app.get('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const stateQuery = `
  select *
  from district
  where district_id = ${districtId};`
  const stateArray = await dataBase.get(stateQuery)
  response.send(convertDbObjectAPI4(stateArray))
})

//API-5 delete district districtID
app.delete('/districts/:districtId/', async (request, response) => {
  const {districtId} = request.params
  const stateQuery = `
  Delete 
  from district
  where district_id = ${districtId};`
  const stateArray = await dataBase.get(stateQuery)
  response.send('District Removed')
})

//API-6 put
app.put('/districts/:districtId/', async (request, repsonse) => {
  const {districtId} = request.params
  const {districtName, stateId, cases, cured, active, deaths} = request.body
  const covidPutistrictQuery = `update district set district_name = "${districtName}",
  state_id = ${stateId},
  cases = ${cases},
  cured = ${cured},
  active = ${active},
  deaths = ${deaths}
  where district_id = ${districtId} ;
   `
  await dataBase.run(covidPutistrictQuery)
  repsonse.send('District Details Updated')
})

//API-7 get

app.get('/states/:stateId/stats/', async (request, response) => {
  const {stateId} = request.params
  const stateQuery = `
  select Sum(cases) as totalCases,
  sum(cured) as totalCured,
  sum(active) as totalActive,
  sum(deaths) as totalDeaths 
  from district 
  where state_id = ${stateId};`
  const stateArray = await dataBase.get(stateQuery)
  response.send(stateArray)
})

//API-8

app.get('/districts/:districtId/details', async (request, response) => {
  const {districtId} = request.params
  const districtQuery = `
  select *
  from district
  where district_id = ${districtId};`
  const stateArray = await dataBase.get(districtQuery)

  const {tateId} = request.params
  const stateQuery = `
  select state_name as stateName from state where state_id = ${stateArray.state_id};`
  const resultArray = await dataBase.get(stateQuery)
  response.send(resultArray)
})

module.exports = app
