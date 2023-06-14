<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBillingTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->string('billing_name')->nullable();
            $table->string('billing_address')->nullable();
            $table->string('billing_municipio')->nullable();
            $table->string('billing_provincia')->nullable();
            $table->integer('billing_postal_code')->nullable();
            $table->string('billing_dni')->nullable();
       
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropColumn('billing_name');
            $table->dropColumn('billing_address');
            $table->dropColumn('billing_municipio');
            $table->dropColumn('billing_provincia');
            $table->dropColumn('billing_postal_code');
            $table->dropColumn('billing_dni');
       
        });
    }
}
