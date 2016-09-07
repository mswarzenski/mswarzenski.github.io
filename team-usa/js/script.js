
var sports = ['Archery', 'Badminton', 'Basketball', 'Beach Volleyball', 'Boxing', 'Canoe (Slalom)', 'Canoe (Sprint)', 'Cycling', 'Diving', 'Equestrian', 'Fencing',
              'Field Hockey', 'Gymnastics', 'Indoor Volleyball', 'Judo', 'Pentathlon', 'Rowing', 'Rugby', 'Sailing', 'Shooting', 'Soccer', 'Swimming', 'Synchro',
              'Table Tennis', 'Taekwondo', 'Tennis', 'Track and Field', 'Triathlon', 'Water Polo', 'Weightlifting', 'Wrestling']

d3.csv("/team-usa/data/team-usa.csv", function(error, _data) {
  if (error) throw error;
  console.log(_data)

  _data.forEach (function(d) {
        d.age = +d.age;
        d.n_games = +d.n_games;
        d.weight = +d.weight;
        d.height_in = parseInt(d.height.split("'")[0])*12 + parseInt(d.height.split("'")[1]);
    });

  data = _data;

});

//draw svgs for each sport;
var stats = [
    {stat: 'age',  chart: 'bar'},
    {stat: 'height',   chart: 'bar'},
    {stat: 'weight',  chart: 'bar'},
    {stat: 'height+weight', chart: 'scatter'},
    {stat: 'hometown',  chart: 'map'},
    // {stat: 'experience',   chart: 'squarepie'},
    {stat: 'gender',     chart: 'squarepie'},
    {stat: 'foreign',   chart: 'squarepie'},
    {stat: 'reside', chart: 'map'},
    {stat: 'athletes',    chart: 'squarepie'}
]



