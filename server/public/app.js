const button = document.getElementById('btn');


button.addEventListener('click', function (e) {
  e.preventDefault();

  var url = document.getElementById('url').value;
  var slug = document.getElementById('slug').value;
  fetch('/url', {
    method: 'POST',
    body: JSON.stringify({
      url: url,
      slug: slug
    }),
    headers: {
      'content-type': 'application/json',
    }
  })
  console.log(res.JSON.body);
});



