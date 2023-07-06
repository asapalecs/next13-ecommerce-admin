export default function AuthLayout({
    children  // Parameter destructuring to extract the 'children' property
  }: {
    children: React.ReactNode  // Type annotation for the 'children' property
  }) {
    return (
      <div className="flex items-center justify-center h-full w-full"> 
        {/* JSX code for a <div> element */}
        {children}  {/* Rendering the child components or elements passed to the AuthLayout component */}
      </div>
    );
  }
  