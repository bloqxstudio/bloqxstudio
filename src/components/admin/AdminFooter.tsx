
import React from 'react';

const AdminFooter = () => {
  return (
    <footer className="border-t py-6">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Bloqx Studio. Todos os direitos reservados.
      </div>
    </footer>
  );
};

export default AdminFooter;
