# csharp-to-typescript

csharp-to-typescript is most flexible and easy to use npm package which doesn't use any third party library for conversion. This package have various options while converting C# Poco to typescript.

## Dependencies

- [Node.js](https://nodejs.org/en/download/)

## install

For npm version greater than 5.0

```
npm i csharp-to-typescript
```

For npm version less than 5.0

```
npm i csharp-to-typescript --save
```

## How to use

1. After installation, import the package.

```
var { CsharpToTs, getConfiguration } = require("csharp-to-typescript");
```

2. Use CsharpToTs to convert your source code
   a. Method one give your source code as string:

```
const sourceCodeInString =   `public class Address
{
  public int Id {get; set;}
  public string Street { get; set; }
  public string City { get; set; }
}`

var outputTypescript = CsharpToTs(sourceCodeInString, getConfiguration());
console.log(outputTypecript);
```

Output is

```
export class Address
{
  Id: number;
  Street: string;
  City: string;
}

```

## Advance Conversion Setting

By default,

1. Access modifier are false.
2. Method type to signature.
3. Change Class to Interface is false.

```
var preserveModifier = false;
var methodType = "signature"; // other options are 'lambda' or 'controller'
var changeToInterface = false;
```

You can change like this:

1. If you want to preserve accessfier

```
var preserveModifier = true;
var methodType = "signature"; // other options are 'lambda' or 'controller'
var changeToInterface = false;

const sourceCodeInString =   `public class Address
{
  public int Id {get; set;}
  public string Street { get; set; }
  public string City { get; set; }
}`

var outputTypescript = CsharpToTs(sourceCodeInString, getConfiguration(preserveModifier, methodType,changeToInterface ));
console.log(outputTypecript);

```

Output:

```
export class Address
{
  public Id: number;
  public Street: string;
  public City: string;
}
```

2. Change class to interface:

```
var preserveModifier = false;
var methodType = "signature"; // other options are 'lambda' or 'controller'
var changeToInterface = true;

const sourceCodeInString =   `public class Address
{
  public int Id {get; set;}
  public string Street { get; set; }
  public string City { get; set; }
}`

var outputTypescript = CsharpToTs(sourceCodeInString, getConfiguration(preserveModifier, methodType,changeToInterface ));
console.log(outputTypecript);

```

Output:

```
export interface Address
{
  Id: number;
  Street: string;
  City: string;
}
```

You can also customized all the variable at once.

```
var preserveModifier = true;
var methodType = "controller"; // other options are 'lambda' or 'controller'
var changeToInterface = true;
```

## License

[MIT](LICENSE)
