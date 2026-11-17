import PlaceHero from '../components/PlaceHero'
import { L } from '../components/bits'

export default function NotFound() {
  return (
    <>
      <PlaceHero id="plaza" title={<>Lost in the <span className="serif">clouds</span></>} lead="This page isn't on the island. Jr can fly you back to the plaza." />
      <L to="/" className="btn btn-solid mt-6">
        Go back home
      </L>
    </>
  )
}
