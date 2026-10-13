function Footer() {
  return (
    <footer className="admin-footer text-center">
      <div className="container-fluid">
        <span>
          Copyright © {new Date().getFullYear()} Secure Circuit | Designing by{" "}
          <a
            href="https://www.esenceweb.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary"
          >
            Esenceweb IT
          </a>
        </span>
      </div>
    </footer>
  );
}

export default Footer;
