// using fetch to call a REST API
fetch("https://jsonplaceholder.typicode.com/comments")
    .then(response => response.json())
    .then(data => console.log(data[25].email));