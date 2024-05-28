import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password:"bahubali",
  // database: "<Enter your database name>",
  // password: "<Enter your pgadmin password>",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Show visited countries
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries");
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
// GET home page
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  res.render("index.ejs", { countries: countries, total: countries.length });
});

//INSERT new country
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  //Checking if the entered country is already in the list or not
  try {
    const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",[input.toLowerCase()]);

    const data = result.rows[0];
    const countryCode = data.country_code;
    //Enter the country into the list if it does not exist in the list
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[countryCode]);
      res.redirect("/");
    } 

    //If country is already added into the list
    catch (err) {
      console.log(err);
      const countries = await checkVisisted();
      res.render("index.ejs", {countries: countries, total: countries.length, error: "Country has already been added, try again.", });
    }
  } 

  //If country does not exist
  catch (err) {
    console.log(err);
    const countries = await checkVisisted();
    res.render("index.ejs", {
      countries: countries,
      total: countries.length,
      error: "Country name does not exist, try again.",
    });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
