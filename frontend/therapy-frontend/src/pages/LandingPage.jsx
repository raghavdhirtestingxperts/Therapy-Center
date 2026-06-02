import { useNavigate } from 'react-router-dom';
import { Heart, ArrowRight, Shield, Calendar, Award } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-wrapper">
      {/* Hero Section */}
      <section className="hero-section text-center py-5">
        <div className="container py-5">
          <div className="badge rounded-pill bg-primary-subtle px-3 py-2 mb-4 animate-fade-in"
               style={{ color: 'var(--primary)' }}>
            Trustworthy Child Care Management
          </div>
          <h1 className="display-3 fw-bold mb-4 gradient-text">
            Nurturing Potential,<br />Empowering Growth
          </h1>
          <p className="lead mb-5 mx-auto" style={{ color: 'var(--text-secondary)', maxWidth: '700px' }}>
            A specialized management platform for therapy centers. Streamlining appointments,
            medical reports, and patient progress to focus on what matters most—the children.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <button
              className="btn btn-primary btn-lg rounded-pill px-5 py-3 d-flex align-items-center gap-2 shadow-lg"
              onClick={() => navigate('/register')}
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button
              className="btn btn-outline-theme btn-lg"
              onClick={() => navigate('/login')}
            >
              Member Login
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section py-5">
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-md-4">
              <div className="p-4 rounded-4 h-100 hover-lift">
                <div className="icon-box bg-primary-subtle mb-3" style={{ color: 'var(--primary)' }}>
                  <Calendar size={24} />
                </div>
                <h4 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Easy Scheduling</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  Generate slots and book sessions with our intelligent scheduling engine.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 h-100 hover-lift">
                <div className="icon-box mb-3"
                     style={{ background: 'rgba(52, 211, 153, 0.12)', color: 'var(--success)' }}>
                  <Shield size={24} />
                </div>
                <h4 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Secure Portals</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  Separate, encrypted portals for Admins, Doctors, and Guardians.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="p-4 rounded-4 h-100 hover-lift">
                <div className="icon-box mb-3"
                     style={{ background: 'rgba(251, 191, 36, 0.12)', color: 'var(--warning)' }}>
                  <Award size={24} />
                </div>
                <h4 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Medical Insights</h4>
                <p style={{ color: 'var(--text-muted)' }}>
                  Comprehensive reporting and findings tracking for every therapy session.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="theme-footer py-4 text-center small">
        &copy; 2026 Special Kids Therapy Center. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;
