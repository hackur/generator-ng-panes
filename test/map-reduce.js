var result = ['i' , 'am' , 'crazy'].map(function(n)
{
	console.log(n);
	return n.toUpperCase();
}).reduce(function(last , _now)
{
	return last.concat(_now);
});

console.log(result);
