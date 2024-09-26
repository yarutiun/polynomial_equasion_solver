#include "../inc/main.hpp"
using namespace std;

double findDescriminant(int a, int b, int c) {
    double res = pow(b, 2) - 4 * a * c;
    cout << "The Descriminant is: " <<  res << endl;
    if(res == 0) {
        cout << "The equation has one real root" << endl;
        return 0;
    } else if(res > 0) {
        cout << "The equation has two real roots" << endl;
        return res;
    } else {
        cout << "The equation has no real roots" << endl;
    }
    return res;
}

vector<double> getCoefficients(string equation) {
    vector<double> coefficients;
    for(int i = 0; i < equation.length(); i++) {
        if(equation[i] == 'x' && equation[i + 1] && equation[i + 1] == '^' && equation[i + 2]) {
            string exponentStr(1, equation[i + 2]);
            double exponent = stod(exponentStr);
            coefficients.push_back(exponent);
        }
    }
    return coefficients;
}

double findDegree(vector<double> coefficients) {
    vector<double>::iterator maxElement = max_element(coefficients.begin(), coefficients.end());
    return *maxElement;
}

void solveQuadratic(int a, int b, int c) {
    double res = findDescriminant(a, b, c);
    if(res == 0) {
        double root = -b / (2 * a);
        cout << "The root is: " << root << endl;
    } else if(res > 0) {
        double root1 = (-b + sqrt(res)) / (2 * a);
        double root2 = (-b - sqrt(res)) / (2 * a);
        cout << "The roots are: " << root1 << " and " << root2 << endl;
    }
}

int main(int argc, char **argv) {
    if(argc == 2) {
        string arg = argv[1];
        if(findDegree(getCoefficients(arg)) > 2) {
            cout << "The polynomial degree is stricly greater than 2, I can't solve." << endl;
        }
        if(findDegree(getCoefficients(arg)) == 2) {
            cout << "Reduced form: " << arg << endl;
            solveQuadratic(1, 2, 1);    
        }
        return 0;
    }
    cout << "Wrong number of arguments" << endl;
    return 0;
}