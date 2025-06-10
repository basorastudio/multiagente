/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */

import { getHours } from "date-fns";

const _htmlEscape = string =>
  string
    .replace(/&/g, "&amp;") // Must happen first or else it will escape other just-escaped characters.
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const _htmlUnescape = htmlString =>
  htmlString
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&#0?39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&"); // Must happen last or else it will unescape other characters in the wrong order.

export function htmlEscape(strings, ...values) {
  if (typeof strings === "string") {
    return _htmlEscape(strings);
  }

  let output = strings[0];
  for (const [index, value] of values.entries()) {
    output = output + _htmlEscape(String(value)) + strings[index + 1];
  }

  return output;
}

export function htmlUnescape(strings, ...values) {
  if (typeof strings === "string") {
    return _htmlUnescape(strings);
  }

  let output = strings[0];
  for (const [index, value] of values.entries()) {
    output = output + _htmlUnescape(String(value)) + strings[index + 1];
  }

  return output;
}

export class MissingValueError extends Error {
  key: any;

  constructor(key) {
    super(
      `Falta un valor para ${key ? `el marcador de posición: ${key}` : "un marcador de posición"}`
    );
    this.name = "MissingValueError";
    this.key = key;
  }
}

export const pupa = function pupa(
  template,
  data,
  { ignoreMissing = true, transform = ({ value }: any) => value } = {}
) {
  if (typeof template !== "string") {
    throw new TypeError(
      `Se esperaba una \`cadena\` en el primer argumento, se obtuvo \`${typeof template}\``
    );
  }

  if (typeof data !== "object") {
    throw new TypeError(
      `Se esperaba un \`objeto\` o \`Array\` en el segundo argumento, se obtuvo \`${typeof data}\``
    );
  }

  const hours = getHours(new Date());
  const getGreeting = () => {
    if (hours >= 6 && hours <= 11) {
      return "¡Buenos días!";
    }
    if (hours > 11 && hours <= 17) {
      return "¡Buenas tardes!";
    }
    if (hours > 17 && hours <= 23) {
      return "¡Buenas noches!";
    }
    return "¡Hola!";
  };

  data = { ...data, greeting: getGreeting() };

  const replace = (placeholder, key) => {
    let value = data;
    for (const property of key.split(".")) {
      value = value ? value[property] : undefined;
    }

    const transformedValue = transform({ value, key });
    if (transformedValue === undefined) {
      if (ignoreMissing) {
        return "";
      }

      throw new MissingValueError(key);
    }

    return String(transformedValue);
  };

  const composeHtmlEscape =
    replacer =>
      (...args: any) =>
        htmlEscape(replacer(...args));

  // La expresión regular intenta coincidir con un número dentro de `{{ }}` o un identificador JS válido o ruta de clave.
  const doubleBraceRegex = /{{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}}/gi;

  if (doubleBraceRegex.test(template)) {
    template = template.replace(doubleBraceRegex, composeHtmlEscape(replace));
  }

  const braceRegex = /{(\d+|[a-z$_][\w\-$]*?(?:\.[\w\-$]*?)*?)}/gi;

  return template.replace(braceRegex, replace);
};
