<?php

/**
 * Created by Reliese Model.
 */

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;

/**
 * Class ImagesProduit
 * 
 * @property int $id
 * @property int $produit_id
 * @property string $nom_fichier
 * @property string $chemin_original
 * @property string|null $chemin_miniature
 * @property string|null $chemin_moyen
 * @property string|null $alt_text
 * @property string|null $titre
 * @property string|null $description
 * @property int $ordre_affichage
 * @property bool $est_principale
 * @property bool $est_visible
 * @property string|null $format
 * @property int|null $taille_octets
 * @property int|null $largeur
 * @property int|null $hauteur
 * @property string|null $couleur_dominante
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property Produit $produit
 *
 * @package App\Models
 */
class ImagesProduit extends Model
{
	protected $table = 'images_produits';

	protected $casts = [
		'produit_id' => 'int',
		'ordre_affichage' => 'int',
		'est_principale' => 'bool',
		'est_visible' => 'bool',
		'taille_octets' => 'int',
		'largeur' => 'int',
		'hauteur' => 'int'
	];

	protected $fillable = [
		'produit_id',
		'nom_fichier',
		'chemin_original',
		'chemin_miniature',
		'chemin_moyen',
		'alt_text',
		'titre',
		'description',
		'ordre_affichage',
		'est_principale',
		'est_visible',
		'format',
		'taille_octets',
		'largeur',
		'hauteur',
		'couleur_dominante'
	];

	public function produit()
	{
		return $this->belongsTo(Produit::class);
	}
}
