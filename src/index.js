const fs = require("fs");

function readTextFile(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, "utf8", (error, data) => {
            if (error) {
                reject("Erro ao ler o arquivo: " + error);
                return;
            }

            const lines = data.split("\n").map(line => line.trim()).filter(line => line.length > 0);

            const objects = lines.map(line => {
                const [name, age, role, state] = line.split(";");
                return {
                    name,
                    age: parseInt(age),
                    role,
                    state
                };

            });

            if (!objects[0]) {
                throw new Error("O objeto está vazio. Encerrando a aplicação.");
            }

            if (objects[0].name === "Nome" && objects[0].role === "Vaga" && objects[0].state === "Estado") {
                objects.shift();
            }

            const roleAgrouped = {};

            objects.forEach(person => {
                const { role } = person;

                if (!roleAgrouped[role]) {
                    roleAgrouped[role] = [];
                }

                roleAgrouped[role].push(person);
            });

            resolve(roleAgrouped);
        });
    });
}

function createCSV(path, data) {

    const header = ["Nome", "Idade", "Vaga", "Estado"];
    const rows = data;

    rows.sort((a, b) => a[0].localeCompare(b[0]));

    const csv = [header].concat(rows).map(row => row.join(";")).join("\n");

    fs.writeFile(path, csv, error => {
        if (error) {
            console.error("Erro ao criar o arquivo CSV:", error);
        } else {
            console.log("Arquivo CSV criado com sucesso:", path);
        }
    });
}

function getCandidatesTotal(candidates, roles) {
    let total = 0;
    for (i = 0; i < roles.length; i++) {
        total += candidates[roles[i]].length;
    }
    return total;
}

function calculateCandidatePercentagePerRole(candidates, roles) {
    const totalCandidates = getCandidatesTotal(candidates, roles);
    rolePercentage = [];

    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];

        rolePercentage[role] = (candidates[roles[i]].length / totalCandidates * 100).toFixed(2) + "%";
    }

    return rolePercentage;
}

function findCandidateAges(candidates, roles) {
    const result = {};

    for (let i = 0; i < roles.length; i++) {
        const role = roles[i];
        let maxAge = 0;
        let minAge = Infinity;
        let averageAge = 0;
        let totalAge = 0;

        for (let j = 0; j < candidates[role].length; j++) {
            const age = candidates[role][j].age;

            totalAge += age;

            if (age < minAge) {
                minAge = age;
            }
            if (age > maxAge) {
                maxAge = age;
            }
        }
        averageAge = parseFloat((totalAge / candidates[role].length).toFixed(2));

        result[role] = {
            minAge,
            maxAge,
            averageAge,
            totalAge
        };

    }

    return result;

}

function isPalindrome(string) {
    if (string.toLowerCase() === string.toLowerCase().split("").reverse().join("")) {
        return true;
    } else {
        return false;
    }
}

function getDistinctStatesFromCandidates(candidates, roles) {
    let distinctStates = new Set();

    for (let i = 0; i < roles.length; i++) {
        for (let j = 0; j < candidates[roles[i]].length; j++) {
            if (!distinctStates.has(candidates[roles[i]][j].state)) {
                distinctStates.add(candidates[roles[i]][j].state);
            }
        }
    }

    return distinctStates.size;
}

async function main() {
    try {
        let academyCandidates = await readTextFile("./Academy_Candidates.txt");

        if (Object.keys(academyCandidates).length === 0) {
            throw new Error("O objeto está vazio. Encerrando a aplicação.");
        }

        let academyRoles = Object.keys(academyCandidates).map(role => role);

        let rolePercentage = calculateCandidatePercentagePerRole(academyCandidates, academyRoles);
        console.log("Os percentuais de candidatos por vaga são: ");
        console.log(rolePercentage);

        let agesResult = findCandidateAges(academyCandidates, academyRoles);

        console.log("Idade média dos candidatos de QA: " + agesResult["QA"].averageAge);
        console.log("Idade do candidato mais velho de Mobile: " + agesResult["Mobile"].maxAge);
        console.log("Idade do candidato mais novo de Web: " + agesResult["Web"].minAge);
        console.log("Soma das idades dos candidatos de QA: " + agesResult["QA"].totalAge);

        console.log("Número de estados distintos presentes entre os candidatos: " + getDistinctStatesFromCandidates(academyCandidates, academyRoles));

        const getInstrutorQA = () => {
            const fromQARole = academyCandidates["QA"];
            for (let i = 0; i < fromQARole.length; i++) {
                if (fromQARole[i].state === "SC") {
                    if (fromQARole[i].age === 25) {
                        if (isPalindrome(fromQARole[i].name.split(" ")[0])) {
                            return fromQARole[i].name;
                        }
                    }
                }
            }
        };

        console.log("Instrutor QA descoberto: " + getInstrutorQA());

        const getInstrutorMobile = () => {
            const fromMobileRole = academyCandidates["Mobile"];
            for (let i = 0; i < fromMobileRole.length; i++) {
                if (fromMobileRole[i].state === "PI") {
                    if (fromMobileRole[i].age > 30 && fromMobileRole[i].age < 40 && fromMobileRole[i].age % 2 === 0) {
                        if (fromMobileRole[i].name.split(" ")[1].split("")[0] === "C") {
                            return fromMobileRole[i].name;
                        }
                    }
                }
            }
        };

        console.log("Instrutor de Mobile descoberto: " + getInstrutorMobile());

        const transformedArray = Object.values(academyCandidates).flatMap(roleArray =>
            roleArray.map(person => [person.name, person.age + " anos", person.role, person.state])
        );

        createCSV("Sorted_Academy_Candidates.csv", transformedArray);

    } catch (error) {
        console.log(error)
    }
}

main();