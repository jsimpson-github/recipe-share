<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\Routing\Annotation\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Method;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\Encoder\XmlEncoder;
use Symfony\Component\Serializer\Encoder\JsonEncoder;
use Symfony\Component\Serializer\Normalizer\ObjectNormalizer;
use Symfony\Component\Config\Definition\Exception\Exception;

use App\Entity\Recipe;

class RecipeController extends Controller
{
	private $serializer;

	public function __construct()
    {
        $encoders = array(new JsonEncoder());
		$normalizers = array(new ObjectNormalizer());
		$this->serializer = new Serializer($normalizers, $encoders);
    }

	/**
     * @Route("/api/recipes")
     * @Method("GET")
     */
    public function myRecipesAction() {
    	$repository = $this->getDoctrine()->getRepository(Recipe::class);
    	$recipes = $repository->findAll();

		$json = $this->serializer->serialize($recipes, 'json');
    	return new Response($json);
    }

    /**
     * @Route("/api/recipes/add")
     * @Method({"POST", "OPTIONS"})
     */
    public function addRecipeAction(Request $request) {
    	$db = $this->getDoctrine()->getManager();

    	$recipeJson = $request->getContent();
		$recipe = $this->serializer->deserialize($recipeJson, Recipe::class, 'json');

		$db->persist($recipe);
		$db->flush();

    	return new JsonResponse(array('status' => 'success', 'id' => $recipe->getId()));
    }
}