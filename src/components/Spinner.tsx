import Spinner from 'react-bootstrap/Spinner';

function CircularSpinner() {
  return (
    <Spinner className='text-primary' animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
    </Spinner>
  );
}

export default CircularSpinner;