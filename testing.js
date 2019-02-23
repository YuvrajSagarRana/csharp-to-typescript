"use strict";
exports.__esModule = true;
var { CsharpToTs, getConfiguration } = require("./index");
var preserveModifier = false;
var methodType = "signature";
var changeToInterface = false;

const sourceCodeInString = `public class Address
{
  public int Id {get; set;}
  public string Street { get; set; }
  public string City { get; set; }
}`;
var outputTypescript = CsharpToTs(sourceCodeInString, getConfiguration());
console.log(outputTypescript);
