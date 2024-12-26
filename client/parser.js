const url = "http://localhost:3000/get-kaspi-good";

fetch(url)
  .then((res) => res.json())
  .then((data) => console.log(data))
  .catch((err) => console.log(err));
