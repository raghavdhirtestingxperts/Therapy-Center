import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Shield, Calendar, Award } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* Hero Section */}
      <section className="hero-section text-center py-5">
        <div className="container py-5">
          <div className="badge rounded-pill bg-primary-subtle text-primary px-3 py-2 mb-4 animate-fade-in">
            Trustworthy Child Care Management
          </div>
          <h1 className="display-3 fw-bold mb-4 gradient-text">
            Nurturing Potential,<br />Empowering Growth
          </h1>
          <p className="lead text-muted mb-5 mx-auto" style={{ maxWidth: '700px' }}>
            A specialized management platform for therapy centers. Streamlining appointments, 
            medical reports, and patient progress to focus on what matters most—the children.
          </p>
          <div className="d-flex justify-content-center gap-3">
            <button 
              className="btn btn-primary btn-lg rounded-pill px-5 py-3 d-flex align-items-center gap-2 shadow-lg"
              onClick={() => navigate('/register')}
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button 
              className="btn btn-outline-dark btn-lg rounded-pill px-5 py-3"
              onClick={() => navigate('/login')}
            >
              Member Login
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-5 bg-white border-top">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 rounded-4 h-100 hover-lift">
                <div className="icon-box bg-primary-subtle text-primary mb-3">
                  <Calendar size={24} />
                </div>
                <h4 className="fw-bold">Easy Scheduling</h4>
                <p className="text-muted">Generate slots and book sessions with our intelligent scheduling engine.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 h-100 hover-lift">
                <div className="icon-box bg-success-subtle text-success mb-3">
                  <Shield size={24} />
                </div>
                <h4 className="fw-bold">Secure Portals</h4>
                <p className="text-muted">Separate, encrypted portals for Admins, Doctors, and Guardians.</p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 h-100 hover-lift">
                <div className="icon-box bg-warning-subtle text-warning mb-3">
                  <Award size={24} />
                </div>
                <h4 className="fw-bold">Medical Insights</h4>
                <p className="text-muted">Comprehensive reporting and findings tracking for every therapy session.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Lite */}
      <footer className="py-4 text-center text-muted small border-top">
        &copy; 2026 Special Kids Therapy Center. All rights reserved.
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .gradient-text {
          background: linear-gradient(135deg, #1e293b 0%, #4f46e5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .hero-section {
          background: radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15) 0%, rgba(255, 255, 255, 0) 50%);
        }
        .icon-box {
          width: 56px;
          height: 56px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 16px;
        }
        .hover-lift {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }
        .animate-fade-in {
          animation: fadeInDown 0.8s ease;
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
};

export default LandingPage;
