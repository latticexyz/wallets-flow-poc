// I usually would only create a module index like this if I am planning to export it as a package import entry point.
// This is here just to demonstrate what a public package might export to consumers to create clearer lines between internal exports and external ones.

export { LoginButton } from "./LoginButton";
export { useLogin } from "./useLogin";
