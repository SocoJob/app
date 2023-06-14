<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;

class CmsServices extends Model implements HasMedia
{
    use InteractsWithMedia;

    /**
     * @var string 
     */
    public $table = 'cms_services';

    /**
     * 
     */
    public const PATH = 'settings';
    
    public $fillable = [
        'key',
        'value',
    ];
}
