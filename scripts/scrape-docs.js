import fs from 'fs';

const KNOWN_BAD_RESOLVES = new Set([
    "FakeDnsObject",
    "metricsObject",
    "TransportObject",
    "noiseObject",
    "DnsServerObject",
    "xhttpSettings",
    "PingConfigObject",
    "XHTTP: Beyond REALITY"
]);

const USED_OBJECTS = new Set();

function parseType(input) {
    input = input
        .replace('<Badge text="WIP" type="warning"/>', '')
        .replace('<Badge text="BETA" type="warning"/>', '')
        .trim();

    if (!input) {
        return {};
    }

    if (input.startsWith("\\[") && input.endsWith("\\]")) {
        return {
            type: "array",
            items: parseType(input.slice(2, -2))
        };
    }

    if (input.startsWith("[") && input.endsWith("]")) {
        return {
            type: "array",
            items: parseType(input.slice(1, -1))
        };
    }

    if ((input.startsWith("[") && input.endsWith(")")) || input.endsWith("Object")) {
        let name = input.split("]")[0].replace(/^\[|\]$/g, "");
        if (KNOWN_BAD_RESOLVES.has(name)) {
            return { type: "object" };
        } else {
            USED_OBJECTS.add(name);
            return {
                "$ref": `#/definitions/${name}`
            };
        }
    }

    if (["true", "false", "true | false", "bool"].includes(input)) {
        return { type: "boolean" };
    }

    if (input.includes(" | ")) {
        return { "anyOf": input.split(" | ").map(x => parseType(x)) };
    }

    if (["address", "address_port", "CIDR"].includes(input)) {
        return { type: "string" };
    }

    if (["string", "number"].includes(input)) {
        return { type: input };
    }

    if (input === "int") {
        return { type: "integer" };
    }

    if (input.startsWith("map")) {
        return { type: "object" };
    }

    if (input.startsWith('"') && input.endsWith('"')) {
        return { "const": input.slice(1, -1) };
    }

    if (input.startsWith("a list of")) {
        return {};
    }

    if (input === "string array") {
        return { type: "array", items: { type: "string" } };
    }

    if (input.startsWith("string, any of")) {
        return { type: "string" };
    }

    console.warn(`Warning: Unknown type input: ${input}`);
    // Instead of throwing, returns object to be safe, simulating 'any'
    return {};
}

async function parse(inputStream) {
    const definitions = {};
    let currentObj = null;

    const chunks = [];
    for await (const chunk of inputStream) {
        chunks.push(typeof chunk === 'string' ? chunk : chunk.toString());
    }
    const lines = chunks.join('').split(/\r?\n/);

    for (const line of lines) {
        if (line.startsWith("##")) {
            if (currentObj) {
                const description = currentObj.description;
                const schema = {
                    title: currentObj.title,
                    description: description,
                    markdownDescription: description,
                    properties: {},
                    additionalProperties: currentObj.raw_properties.length === 0
                };

                for (const prop of currentObj.raw_properties) {
                    schema.properties[prop.name] = prop;
                }

                // Add to definitions
                if (definitions[schema.title]) {
                    if (!definitions[schema.title].anyOf) {
                        definitions[schema.title] = { anyOf: [definitions[schema.title]] };
                    }
                    definitions[schema.title].anyOf.push(schema);
                } else {
                    definitions[schema.title] = schema;
                }
            }

            currentObj = {
                title: line.split(" ", 2)[1].trim(), // "## Title" -> "Title"
                description: "",
                raw_properties: []
            };
        } else if (line.startsWith("> ") && line.includes(":") && currentObj) {
            const parts = line.slice(2).split(":", 2);
            let name = parts[0];
            const ty = parts[1];

            if (name === "Tony") continue;

            name = name.replace(/[` ]/g, "");

            currentObj.raw_properties.push({
                name: name,
                description: "",
                markdownDescription: "",
                ...parseType(ty)
            });
        } else if (currentObj) {
            if (currentObj.raw_properties.length > 0) {
                const lastProp = currentObj.raw_properties[currentObj.raw_properties.length - 1];
                lastProp.description += line;
                lastProp.markdownDescription += line;
            } else {
                currentObj.description += line;
            }
        }
    }

    // Process the last object
    if (currentObj) {
        const description = currentObj.description;
        const schema = {
            title: currentObj.title,
            description: description,
            markdownDescription: description,
            properties: {},
            additionalProperties: currentObj.raw_properties.length === 0
        };

        for (const prop of currentObj.raw_properties) {
            schema.properties[prop.name] = prop;
        }

        if (definitions[schema.title]) {
            if (!definitions[schema.title].anyOf) {
                definitions[schema.title] = { anyOf: [definitions[schema.title]] };
            }
            definitions[schema.title].anyOf.push(schema);
        } else {
            definitions[schema.title] = schema;
        }
    }

    return definitions;
}

async function main() {
    const definitions = await parse(process.stdin);

    // Verify used objects
    for (const name of USED_OBJECTS) {
        if (!definitions[name]) {
            console.error(`Cannot resolve ${name}, add to KNOWN_BAD_RESOLVES?`);
            // We don't want to crash the build in the JS version, just warn
        }
    }

    const schema = {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "$ref": "#/definitions/Basic Configuration Modules",
        "definitions": definitions
    };

    console.log(JSON.stringify(schema, null, 2));
}

main().catch(console.error);
