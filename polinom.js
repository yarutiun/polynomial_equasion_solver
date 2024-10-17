const readline = require('readline');

/**
 * Parses a polynomial equation and returns the combined coefficients.
 * Moves all terms to the LHS and sets RHS to zero.
 * @param {string} equation - The polynomial equation as a string.
 * @returns {object} An object containing the combined coefficients.
 */
function parseEquation(equation) {
    // Remove all whitespaces
    const cleanEquation = equation.replace(/\s/g, '');

    // Split equation into LHS and RHS
    const [lhs, rhs] = cleanEquation.split('=');

    if (!lhs || rhs === undefined) {
        throw new Error("Invalid equation format. Ensure it contains '=' sign.");
    }

    // Function to extract terms and their coefficients
    const extractTerms = (side) => {
        // Match terms with pattern: optional sign, optional coefficient, *X^, exponent
        // Also handle constant terms: optional sign, coefficient, *X^0
        const regex = /([+-]?)(\d*\.?\d*)\*?X\^(\d+)/g;
        const terms = {};
        let match;

        while ((match = regex.exec(side)) !== null) {
            let sign = match[1] === '-' ? -1 : 1;
            let coefficient = match[2] === '' ? 1 : parseFloat(match[2]);
            const exponent = parseInt(match[3]);

            // Handle cases like "-X^2" where coefficient is implied as -1
            if (match[2] === '' && match[1] === '-') {
                coefficient = -1;
            } else if (match[2] === '' && match[1] === '+') {
                coefficient = 1;
            }

            if (terms[exponent] !== undefined) {
                terms[exponent] += sign * coefficient;
            } else {
                terms[exponent] = sign * coefficient;
            }
        }

        return terms;
    };

    // Function to extract constant term (X^0)
    const extractConstant = (side) => {
        // Match constant term: optional sign, coefficient, possibly followed by end or +
        const regex = /([+-]?)(\d*\.?\d+)\*?X\^0/g;
        let constant = 0;
        let match;

        while ((match = regex.exec(side)) !== null) {
            let sign = match[1] === '-' ? -1 : 1;
            let coefficient = parseFloat(match[2]);
            constant += sign * coefficient;
        }

        return constant;
    };

    // Extract terms from both sides
    const lhsTerms = extractTerms(lhs);
    const rhsTerms = extractTerms(rhs);

    // Extract constants
    const lhsConstant = extractConstant(lhs);
    const rhsConstant = extractConstant(rhs);

    // Combine coefficients by moving RHS terms to LHS (subtracting RHS coefficients)
    const combinedCoefficients = {};

    // Collect all exponents from both sides
    const exponents = new Set([
        ...Object.keys(lhsTerms).map(k => parseInt(k)),
        ...Object.keys(rhsTerms).map(k => parseInt(k))
    ]);

    exponents.forEach(exp => {
        const lhsCoeff = lhsTerms[exp] || 0;
        const rhsCoeff = rhsTerms[exp] || 0;
        combinedCoefficients[exp] = lhsCoeff - rhsCoeff;
    });

    // Handle constants (X^0)
    combinedCoefficients[0] = (lhsConstant || 0) - (rhsConstant || 0);

    return combinedCoefficients;
}

function generateReducedForm(coefficients) {
    // Get all exponents sorted in ascending order
    const exponents = Object.keys(coefficients)
        .map(k => parseInt(k))
        .sort((a, b) => a - b);

        let reducedForm = '';
        exponents.forEach(exp => {
          const coeff = coefficients[exp];
          if (coeff === 0) return; // Skip zero coefficients
      
          // Determine the sign
          if (reducedForm === '') {
            reducedForm += coeff >= 0 ? '' : '- ';
          } else {
            reducedForm += coeff >= 0 ? ' + ' : ' - ';
          }
      
          // Absolute value of coefficient
          const absCoeff = Math.abs(coeff);
      
          // **Skip unnecessary leading zero:**
          if (absCoeff !== 0) {
            reducedForm += absCoeff;
          } else if (absCoeff === 0 && exp !== 0) {
            // Handle zero coefficient for non-constant terms (e.g., 0 * X^1)
            reducedForm += '0';
          }
      
          // Append variable part
          if (exp !== 0) {
            reducedForm += ` * X^${exp}`;
          }
        });
      
        // **Skip unnecessary "1 * X^0" term:**
        if (reducedForm.length > 0 && reducedForm.indexOf('X^0') === -1) {
          reducedForm += ' + 1 * X^0';
        }
      
        // If all coefficients are zero
        if (reducedForm === '') {
          reducedForm = '0';
        }
      
        reducedForm += ' = 0';
      
        return reducedForm;
}

function determineDegree(coefficients) {
    const exponents = Object.keys(coefficients).map(k => parseInt(k));
    return Math.max(...exponents);
}

function solvePolynomial(coefficients) {
    const degree = determineDegree(coefficients);

    if (degree > 2) {
        return {
            degree,
            description: "The polynomial degree is greater than 2, can't solve."
        };
    }

    if (degree === 2) {
        // Quadratic equation: ax^2 + bx + c = 0
        const a = coefficients[2] || 0;
        const b = coefficients[1] || 0;
        const c = coefficients[0] || 0;

        if (a === 0) {
            // Degenerates to linear equation
            if (b === 0) {
                return {
                    degree: 0,
                    description: c === 0 ? "All real numbers are solutions." : "No solution."
                };
            } else {
                const x = -c / b;
                return {
                    degree: 1,
                    solutions: [x],
                    description: "Linear equation, one real solution."
                };
            }
        }

        const discriminant = b * b - 4 * a * c;
        let root1, root2;

        if (discriminant > 0) {
            // Two distinct real roots
            const sqrtD = Math.sqrt(discriminant);
            root1 = (-b + sqrtD) / (2 * a);
            root2 = (-b - sqrtD) / (2 * a);
            return {
                degree: 2,
                discriminant,
                solutions: [root1, root2],
                description: "Discriminant is positive, two real solutions."
            };
        } else if (discriminant === 0) {
            // One real root (repeated)
            root1 = -b / (2 * a);
            return {
                degree: 2,
                discriminant,
                solutions: [root1],
                description: "Discriminant is zero, one real solution."
            };
        } else {
            // Two complex roots
            const realPart = (-b / (2 * a)).toFixed(2);
            const imaginaryPart = (Math.sqrt(-discriminant) / (2 * a)).toFixed(2);
            root1 = `${realPart} + ${imaginaryPart}i`;
            root2 = `${realPart} - ${imaginaryPart}i`;
            return {
                degree: 2,
                discriminant,
                solutions: [root1, root2],
                description: "Discriminant is negative, two complex solutions."
            };
        }
    } else if (degree === 1) {
        // Linear equation: bx + c = 0
        const b = coefficients[1] || 0;
        const c = coefficients[0] || 0;

        if (b === 0) {
            return {
                degree: 0,
                description: c === 0 ? "All real numbers are solutions." : "No solution."
            };
        }

        const x = -c / b;
        return {
            degree: 1,
            solutions: [x],
            description: "Linear equation, one real solution."
        };
    } else if (degree === 0) {
        // Constant equation: c = 0
        const c = coefficients[0] || 0;
        return {
            degree: 0,
            solutions: [],
            description: c === 0 ? "All real numbers are solutions." : "No solution."
        };
    }
}

function displaySolution(solution, reducedForm) {
    console.log(`\nReduced form: ${reducedForm}`);
    console.log(`Polynomial degree: ${solution.degree}`);

    if (solution.degree > 2) {
        console.log(solution.description);
        return;
    }

    if (solution.solutions) {
        if (solution.solutions.length === 2) {
            console.log("The solutions are:");
            console.log(`x₁ = ${solution.solutions[0]}`);
            console.log(`x₂ = ${solution.solutions[1]}`);
        } else if (solution.solutions.length === 1) {
            console.log("The solution is:");
            console.log(`x = ${solution.solutions[0]}`);
        }
    } else {
        console.log(solution.description);
    }
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Enter the polynomial equation (e.g., "5 * X^0 + 4 * X^1 - 9.3 * X^2 = 1 * X^0"): ', (equation) => {
    try {
        const coefficients = parseEquation(equation);
        const reducedForm = generateReducedForm(coefficients);
        const solution = solvePolynomial(coefficients);
        displaySolution(solution, reducedForm);
    } catch (error) {
        console.error(`\nError: ${error.message}`);
    } finally {
        rl.close();
    }
});