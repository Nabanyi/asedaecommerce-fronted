import { useContext, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { fetchDataFromApi } from "../ApiHelper";
import { showCustomErrorAlert } from "../Helper";
import { UserContext } from "../UserContext";
import { ButtonLoader } from "../components/ButtonLoading";

export const Login = () => {
    const navigate = useNavigate();
    const { login } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const [loginFormData, setLoginFormData] = useState({username:'', password:''});
    const onLoginInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setLoginFormData({ ...loginFormData, [name]: value});
    };

    const submitLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if(loginFormData.username == ""){
            showCustomErrorAlert("Please enter your username to login");
            return false;
        }

        if(loginFormData.password == ""){
            showCustomErrorAlert("Please enter your password to login");
            return false;
        }

        setIsLoading(true)

        try {
            const response = await fetchDataFromApi('auth/login', 'POST', loginFormData);
            if (response.status) {
                setIsLoading(false)
                login(response.result);
                navigate('/home');
            } else {
              setIsLoading(false)
              showCustomErrorAlert(response.message);
            }
        } catch (error) {
          setIsLoading(false)
        }
      };

    return (
        <div className="container pt-5">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <div className="card shadow">
                <div className="card-body">
                  <h2 className="card-title text-center mb-4">Login</h2>
                  <form onSubmit={submitLogin}>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label">
                        Email address
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="username"
                        name="username"
                        placeholder="Enter your username"
                        onChange={onLoginInputChange}
                        value={loginFormData.username}
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="password" className="form-label">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        className="form-control"
                        id="password"
                        placeholder="Enter your password"
                        onChange={onLoginInputChange}
                        value={loginFormData.password}
                      />
                    </div>
                    <button disabled={isLoading} type="submit" className="btn btn-primary w-100">
                        {isLoading ? 
                        (
                          <ButtonLoader/>
                        ):(
                            "Login"
                        )}
                    </button>
                  </form>
                  <div className="text-center mt-3">
                    <p className="mb-0">
                      Don't have an account? <a href="#signup">Sign up</a>
                    </p>
                    <p>
                      <a href="#forgot-password">Forgot password?</a>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
}