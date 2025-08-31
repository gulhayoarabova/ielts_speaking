import Register from "@/components/Register";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const RegisterPage = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Register />
      </main>
      <Footer />
    </div>
  );
};

export default RegisterPage;