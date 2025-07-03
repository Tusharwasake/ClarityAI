let arr = [10, 2, 4, 17];

for (let i = 0; i < arr.length; i++) {
  let first = arr[i].split("").map(Number);
  for (let j = 0; j < arr.length; j++) {
    if (first > arr[j]) {
      let temp = arr[j];
      arr[j] = arr[i];
      arr[i] = temp;
    }
  }
}

console.log(arr);
