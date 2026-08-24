const e = React.createElement;

function App() {
  const [countries, setCountries] = React.useState([]);

  React.useEffect(() => {
    fetch("https://restcountries.com/v3.1/all")
      .then(res => res.json())
      .then(data => setCountries(data));
  }, []);

  return e(
    "div",
    { className: "country-container" },
    countries.map((country, index) =>
      e(
        "div",
        { className: "country-card", key: index },
        e("img", { src: country.flags?.png }),
        e("h3", null, country.name.common),
        e("p", null, "Region: " + country.region),
        e("p", null, "Population: " + country.population.toLocaleString())
      )
    )
  );
}

ReactDOM.render(e(App), document.getElementById("root"));
